/**
 * sync-atlas-data.ts
 *
 * Syncs supply-chain, relationship, and robot-spec data from the
 * humanoid-atlas GitHub repo into our local JSON data files.
 *
 * Usage:  npx tsx scripts/sync-atlas-data.ts
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'fs'
import { execSync } from 'child_process'
import { join } from 'path'

// ── Mapping tables ──────────────────────────────────────────────────

const COMPANY_SLUG_MAP: Record<string, string | null> = {
  tesla: 'tesla-optimus',
  figure: 'figure-ai',
  boston_dynamics: 'boston-dynamics',
  apptronik: 'apptronik',
  agility: 'agility-robotics',
  '1x': '1x-technologies',
  unitree: 'unitree',
  agibot: 'agibot',
  xpeng: 'xpeng-robotics',
  ubtech: 'ubtech',
  sanctuary: 'sanctuary-ai',
  fourier: 'fourier-intelligence',
  kepler: 'kepler',
  engineai: null,
  dexmate: null,
  sunday: 'sunday-robot',
}

const ROBOT_SLUG_MAP: Record<string, string> = {
  tesla: 'optimus-gen2',
  figure: 'figure-03',
  boston_dynamics: 'atlas-electric',
  apptronik: 'apollo-gen2',
  agility: 'digit-v5',
  '1x': 'neo-beta',
  unitree: 'unitree-g1',
  agibot: 'agibot-a2',
  xpeng: 'iron',
  ubtech: 'walker-s2',
  sanctuary: 'phoenix',
  fourier: 'gr2',
  kepler: 'kepler-forerunner',
}

const CATEGORY_MAP: Record<string, string> = {
  skeleton: 'Structural Materials & Frames',
  bldc_motors: 'Actuators & Motors',
  reducers: 'Precision Reducers & Gearboxes',
  screws: 'Bearings & Linear Motion',
  bearings: 'Bearings & Linear Motion',
  actuators_rotary: 'Actuators & Motors',
  actuators_linear: 'Actuators & Motors',
  batteries: 'Batteries & Power',
  compute: 'Compute & AI Chips',
  pcbs: 'Power Electronics & Motor Controllers',
  sensors: 'Sensors & Vision',
  tactile: 'Sensors & Vision',
  end_effectors: 'Dexterous Hands',
}

// Atlas robotSpecs field → our robot-specs.json field
const SPEC_FIELD_MAP: Record<string, string> = {
  motor: 'motorType',
  actuatorBody: 'actuatorBody',
  actuatorHand: 'actuatorHand',
  transmission: 'transmission',
  materials: 'materials',
  compute: 'compute',
  battery: 'batteryChemistry',
  charging: 'charging',
  aiPartner: 'aiPartner',
  externalSensors: 'externalSensors',
  internalSensors: 'internalSensors',
  software: 'software',
  dataCollection: 'dataCollection',
  price: 'bomEstimate',
  endEffector: 'endEffector',
  locomotion: 'locomotion',
  tactileSensing: 'tactileSensing',
}

// ── Paths ───────────────────────────────────────────────────────────

const PROJECT_ROOT = join(import.meta.dirname!, '..')
const DATA_DIR = join(PROJECT_ROOT, 'content', 'data')
const SUPPLY_CHAIN_PATH = join(DATA_DIR, 'supply-chain.json')
const RELATIONSHIPS_PATH = join(DATA_DIR, 'supply-chain-relationships.json')
const ROBOT_SPECS_PATH = join(DATA_DIR, 'robot-specs.json')

const ATLAS_REPO = 'https://github.com/kingjulio8238/humanoid-atlas.git'
const CLONE_DIR = join(PROJECT_ROOT, '.atlas-tmp')

// ── Helpers ─────────────────────────────────────────────────────────

interface AtlasCompany {
  id: string
  name: string
  type: string
  country: string
  description?: string
  robotSpecs?: Record<string, unknown>
  [k: string]: unknown
}

interface AtlasRelationship {
  id: string
  from: string
  to: string
  component: string
  description?: string
  bomPercent?: number
}

interface AtlasComponent {
  id: string
  name: string
  bottleneck?: boolean
  bottleneckReason?: string
  avgCostPercent?: number
  [k: string]: unknown
}

interface SupplyChainCategory {
  category: string
  suppliers: Array<{
    company: string
    products: string[]
    customers: string[]
    hq: string
    criticality: string
  }>
  bottleneck: boolean
  bottleneckReason: string | null
  avgCostPercent: number | null
}

interface Relationship {
  supplier: string
  robot: string
  robotSlug: string | null
  companySlug: string | null
  component: string
  category: string
  confidence: string
}

/**
 * Extract a JS array from a TypeScript data file by stripping TS-specific
 * syntax and evaluating the resulting JS with the Function constructor.
 * Same approach as /tmp/extract-atlas.mjs.
 */
function extractArray(filePath: string): unknown[] {
  let text = readFileSync(filePath, 'utf-8')

  // Remove import lines
  text = text.replace(/^import\s+.*;\s*$/gm, '')

  // Remove type annotations: "export const foo: Bar[] =" → "const foo ="
  text = text.replace(/export\s+const\s+(\w+)\s*:\s*\w+\[\]\s*=/g, 'const $1 =')

  // Remove "as const"
  text = text.replace(/\bas\s+const\b/g, '')

  // Find the array literal
  const match = text.match(/=\s*(\[[\s\S]*\])\s*;/)
  if (!match) throw new Error(`Could not find array in ${filePath}`)

  // Strip single-line comments
  const cleaned = match[1].replace(/\/\/.*$/gm, '')

  return new Function(`return ${cleaned}`)() as unknown[]
}

// ── Clone atlas repo ────────────────────────────────────────────────

function cloneAtlas(): void {
  if (existsSync(CLONE_DIR)) {
    rmSync(CLONE_DIR, { recursive: true, force: true })
  }
  console.log('Cloning humanoid-atlas (shallow)...')
  execSync(`git clone --depth 1 ${ATLAS_REPO} ${CLONE_DIR}`, {
    stdio: 'pipe',
  })
  console.log('Clone complete.')
}

// ── Merge: supply-chain.json ────────────────────────────────────────

function mergeSupplyChain(
  categories: SupplyChainCategory[],
  atlasComponents: AtlasComponent[],
  atlasCompanies: AtlasCompany[],
  atlasRelationships: AtlasRelationship[],
): { data: SupplyChainCategory[]; stats: { bottlenecksUpdated: number; suppliersAdded: number } } {
  const stats = { bottlenecksUpdated: 0, suppliersAdded: 0 }

  // Build a lookup: atlas component id → our category name
  // Then update bottleneck/avgCostPercent where ours are unset.
  for (const comp of atlasComponents) {
    const ourCategoryName = CATEGORY_MAP[comp.id]
    if (!ourCategoryName) continue

    const cat = categories.find((c) => c.category === ourCategoryName)
    if (!cat) continue

    // Only fill in if ours are not already set
    if (cat.bottleneck === false && comp.bottleneck === true) {
      cat.bottleneck = true
      if (comp.bottleneckReason && !cat.bottleneckReason) {
        cat.bottleneckReason = comp.bottleneckReason
      }
      stats.bottlenecksUpdated++
    }
    if (cat.avgCostPercent == null && comp.avgCostPercent != null) {
      cat.avgCostPercent = comp.avgCostPercent
      stats.bottlenecksUpdated++
    }
  }

  // Find atlas suppliers (component_maker type) and add missing ones
  const supplierCompanies = atlasCompanies.filter(
    (c) => c.type === 'component_maker' || c.type === 'ai_compute' || c.type === 'raw_material',
  )

  // Build a map: supplier id → components they supply (from relationships)
  const supplierComponents = new Map<string, Set<string>>()
  const supplierCustomers = new Map<string, Set<string>>()
  for (const rel of atlasRelationships) {
    if (!supplierComponents.has(rel.from)) {
      supplierComponents.set(rel.from, new Set())
    }
    supplierComponents.get(rel.from)!.add(rel.component)

    if (!supplierCustomers.has(rel.from)) {
      supplierCustomers.set(rel.from, new Set())
    }
    // Map OEM ID to display name
    const oem = atlasCompanies.find((c) => c.id === rel.to)
    if (oem) {
      // Use a cleaner name (strip parenthetical)
      const cleanName = oem.name.replace(/\s*\(.*\)$/, '')
      supplierCustomers.get(rel.from)!.add(cleanName)
    }
  }

  // For each supplier, determine which category it belongs to
  for (const supplier of supplierCompanies) {
    // Check each category for this supplier
    const components = supplierComponents.get(supplier.id)
    if (!components) continue

    // Find which category this supplier maps to based on relationships
    for (const cat of categories) {
      // Check if supplier already exists in this category
      const existingSupplier = cat.suppliers.find(
        (s) => s.company.toLowerCase() === supplier.name.toLowerCase(),
      )
      if (existingSupplier) continue

      // Determine if any of this supplier's components map to this category
      // Use a reverse lookup: check atlas relationships for this supplier + OEMs in this category
      const componentNames = Array.from(components)
      const relevantComponent = componentNames.find((compName) => {
        // Check if any relationship with this component maps to this category
        for (const rel of atlasRelationships) {
          if (rel.from === supplier.id && rel.component === compName) {
            // Find the atlas component that matches
            for (const [atlasCompId, catName] of Object.entries(CATEGORY_MAP)) {
              if (catName === cat.category) {
                // Check if the component name relates to this atlas component
                const atlasComp = atlasComponents.find((c) => c.id === atlasCompId)
                if (atlasComp && atlasComp.name.toLowerCase().includes(compName.toLowerCase().split(' ')[0])) {
                  return true
                }
              }
            }
          }
        }
        return false
      })

      if (!relevantComponent) continue

      // Determine country code → region
      const hqMap: Record<string, string> = {
        US: 'USA',
        JP: 'Japan',
        DE: 'Germany',
        CH: 'Switzerland',
        CN: 'China',
        SE: 'Sweden',
        KR: 'South Korea',
        TW: 'Taiwan',
        NL: 'Netherlands',
        AU: 'Australia',
      }

      const customers = supplierCustomers.get(supplier.id)
      const newSupplier = {
        company: supplier.name,
        products: Array.from(components),
        customers: customers ? Array.from(customers) : [],
        hq: hqMap[supplier.country] || supplier.country,
        criticality: 'medium' as string,
      }

      cat.suppliers.push(newSupplier)
      stats.suppliersAdded++
    }
  }

  return { data: categories, stats }
}

// ── Merge: supply-chain-relationships.json ──────────────────────────

function mergeRelationships(
  existing: Relationship[],
  atlasRelationships: AtlasRelationship[],
  atlasCompanies: AtlasCompany[],
): { data: Relationship[]; stats: { added: number; skipped: number } } {
  const stats = { added: 0, skipped: 0 }

  // Build lookup: atlas company id → name
  const companyNames = new Map<string, string>()
  for (const c of atlasCompanies) {
    companyNames.set(c.id, c.name.replace(/\s*\(.*\)$/, ''))
  }

  // Build existing key set for dedup
  const existingKeys = new Set(
    existing.map((r) =>
      `${r.supplier.toLowerCase()}|${r.robotSlug || ''}|${r.component.toLowerCase()}`,
    ),
  )

  for (const rel of atlasRelationships) {
    const supplierName = companyNames.get(rel.from)
    if (!supplierName) continue

    const oem = atlasCompanies.find((c) => c.id === rel.to)
    if (!oem) continue

    const companySlug = COMPANY_SLUG_MAP[rel.to] ?? null
    const robotSlug = ROBOT_SLUG_MAP[rel.to] ?? null
    const robotName = oem.name.replace(/\s*\(.*\)$/, '')

    // Determine category from component name
    let category = 'Actuators & Motors' // default
    for (const [atlasCompId, catName] of Object.entries(CATEGORY_MAP)) {
      const compLower = rel.component.toLowerCase()
      if (
        compLower.includes('motor') || compLower.includes('bldc') ? atlasCompId === 'bldc_motors' :
        compLower.includes('harmonic') || compLower.includes('reducer') || compLower.includes('cycloidal') ? atlasCompId === 'reducers' :
        compLower.includes('screw') || compLower.includes('roller') ? atlasCompId === 'screws' :
        compLower.includes('bearing') ? atlasCompId === 'bearings' :
        compLower.includes('batter') || compLower.includes('cell') ? atlasCompId === 'batteries' :
        compLower.includes('gpu') || compLower.includes('chip') || compLower.includes('soc') || compLower.includes('compute') ? atlasCompId === 'compute' :
        compLower.includes('sensor') || compLower.includes('lidar') || compLower.includes('camera') ? atlasCompId === 'sensors' :
        compLower.includes('tactile') || compLower.includes('touch') ? atlasCompId === 'tactile' :
        compLower.includes('hand') || compLower.includes('gripper') || compLower.includes('effector') ? atlasCompId === 'end_effectors' :
        compLower.includes('pcb') || compLower.includes('driver') || compLower.includes('controller') ? atlasCompId === 'pcbs' :
        compLower.includes('frame') || compLower.includes('skeleton') || compLower.includes('aluminum') ? atlasCompId === 'skeleton' :
        false
      ) {
        category = catName
        break
      }
    }

    const key = `${supplierName.toLowerCase()}|${robotSlug || ''}|${rel.component.toLowerCase()}`
    if (existingKeys.has(key)) {
      stats.skipped++
      continue
    }

    existing.push({
      supplier: supplierName,
      robot: robotName,
      robotSlug,
      companySlug,
      component: rel.component,
      category,
      confidence: 'inferred',
    })
    existingKeys.add(key)
    stats.added++
  }

  return { data: existing, stats }
}

// ── Merge: robot-specs.json ─────────────────────────────────────────

function mergeRobotSpecs(
  robots: Record<string, unknown>[],
  atlasCompanies: AtlasCompany[],
): { data: Record<string, unknown>[]; stats: { fieldsAdded: number; robotsUpdated: number } } {
  const stats = { fieldsAdded: 0, robotsUpdated: 0 }

  const oems = atlasCompanies.filter((c) => c.type === 'oem' && c.robotSpecs)

  for (const oem of oems) {
    const robotSlug = ROBOT_SLUG_MAP[oem.id]
    if (!robotSlug) continue

    const robot = robots.find((r) => r.slug === robotSlug)
    if (!robot) continue

    const specs = oem.robotSpecs!
    let updated = false

    for (const [atlasField, ourField] of Object.entries(SPEC_FIELD_MAP)) {
      if (specs[atlasField] != null && robot[ourField] == null) {
        robot[ourField] = specs[atlasField]
        stats.fieldsAdded++
        updated = true
      }
    }

    if (updated) stats.robotsUpdated++
  }

  return { data: robots, stats }
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Atlas Data Sync ===\n')

  // 1. Clone
  cloneAtlas()

  try {
    // 2. Extract atlas data
    const atlasDataDir = join(CLONE_DIR, 'src', 'data')
    const companiesPath = join(atlasDataDir, 'companies.ts')
    const relationshipsPath = join(atlasDataDir, 'relationships.ts')
    const componentsPath = join(atlasDataDir, 'components.ts')

    if (!existsSync(companiesPath)) {
      console.error('Atlas data files not found at expected path. Aborting.')
      process.exit(1)
    }

    console.log('Extracting atlas data...')
    const atlasCompanies = extractArray(companiesPath) as AtlasCompany[]
    const atlasRelationships = extractArray(relationshipsPath) as AtlasRelationship[]
    const atlasComponents = extractArray(componentsPath) as AtlasComponent[]

    console.log(`  Companies:     ${atlasCompanies.length}`)
    console.log(`  Relationships: ${atlasRelationships.length}`)
    console.log(`  Components:    ${atlasComponents.length}\n`)

    // 3. Read our data
    const supplyChain: SupplyChainCategory[] = JSON.parse(
      readFileSync(SUPPLY_CHAIN_PATH, 'utf-8'),
    )
    const relationships: Relationship[] = JSON.parse(
      readFileSync(RELATIONSHIPS_PATH, 'utf-8'),
    )
    const robotSpecs: Record<string, unknown>[] = JSON.parse(
      readFileSync(ROBOT_SPECS_PATH, 'utf-8'),
    )

    // 4. Merge
    console.log('Merging supply-chain.json...')
    const sc = mergeSupplyChain(supplyChain, atlasComponents, atlasCompanies, atlasRelationships)

    console.log('Merging supply-chain-relationships.json...')
    const rels = mergeRelationships(relationships, atlasRelationships, atlasCompanies)

    console.log('Merging robot-specs.json...')
    const specs = mergeRobotSpecs(robotSpecs, atlasCompanies)

    // 5. Write
    writeFileSync(SUPPLY_CHAIN_PATH, JSON.stringify(sc.data, null, 2) + '\n')
    writeFileSync(RELATIONSHIPS_PATH, JSON.stringify(rels.data, null, 2) + '\n')
    writeFileSync(ROBOT_SPECS_PATH, JSON.stringify(specs.data, null, 2) + '\n')

    // 6. Summary
    console.log('\n=== Sync Summary ===')
    console.log(`supply-chain.json:`)
    console.log(`  Bottleneck fields updated: ${sc.stats.bottlenecksUpdated}`)
    console.log(`  New suppliers added:       ${sc.stats.suppliersAdded}`)
    console.log(`supply-chain-relationships.json:`)
    console.log(`  New relationships added:   ${rels.stats.added}`)
    console.log(`  Duplicates skipped:        ${rels.stats.skipped}`)
    console.log(`robot-specs.json:`)
    console.log(`  Robots updated:            ${specs.stats.robotsUpdated}`)
    console.log(`  New fields added:          ${specs.stats.fieldsAdded}`)
    console.log('\nDone.')
  } finally {
    // Cleanup
    if (existsSync(CLONE_DIR)) {
      rmSync(CLONE_DIR, { recursive: true, force: true })
    }
  }
}

main().catch((err) => {
  console.error('Sync failed:', err)
  // Cleanup on error
  if (existsSync(CLONE_DIR)) {
    rmSync(CLONE_DIR, { recursive: true, force: true })
  }
  process.exit(1)
})
