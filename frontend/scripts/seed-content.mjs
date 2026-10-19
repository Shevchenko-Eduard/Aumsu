import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const frontendRoot = path.resolve(scriptDir, '..')
const repoRoot = path.resolve(frontendRoot, '..')
const extracted = path.join(repoRoot, 'СборДанных/data/extracted')
const contentDir = path.join(frontendRoot, 'content')

const now = '2026-10-19T12:00:00.000Z'

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function writeJson(rel, value) {
  const file = path.join(contentDir, rel)
  ensureDir(path.dirname(file))
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', 'utf8')
}

function clearDir(dir) {
  if (!fs.existsSync(dir)) return
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name)
    if (entry.isDirectory()) clearDir(target)
    else fs.unlinkSync(target)
  }
}

const translit = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'j', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh',
  щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya'
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[«»"'.,:;!?()]/g, ' ')
    .split('')
    .map((char) => translit[char] ?? char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90)
}

function p(text) {
  return { type: 'paragraph', text }
}
function h(text, level = 2) {
  return { type: 'heading', level, text }
}
function list(items, ordered = false) {
  return { type: 'list', ordered, items }
}
function table(headers, rows, caption) {
  return { type: 'table', headers, rows, caption }
}
function callout(tone, title, text) {
  return { type: 'callout', tone, title, text }
}
function accordion(items) {
  return { type: 'accordion', items }
}

const organization = readJson(path.join(extracted, 'organization.json'))
const struct = readJson(path.join(extracted, 'sveden/struct.json'))
const education = readJson(path.join(extracted, 'sveden/education.json'))
const employeesRaw = readJson(path.join(extracted, 'sveden/employees.json'))
const managersRaw = readJson(path.join(extracted, 'sveden/managers.json'))
const documentsRaw = readJson(path.join(extracted, 'documents.json'))

const ruSite = {
  locale: 'ru',
  siteUrl: 'https://aumsu.ru',
  siteName: 'ГМУ им. адм. Ф.Ф. Ушакова',
  shortName: 'ГМУ',
  defaultSeo: {
    titleTemplate: '%s — ГМУ им. адм. Ф.Ф. Ушакова',
    description:
      'Официальный сайт Государственного морского университета имени адмирала Ф.Ф. Ушакова',
    ogImage: '/media/og/default.jpg'
  },
  contacts: {
    address: '353924, Краснодарский край, г. Новороссийск, проспект Ленина, 93',
    phones: ['+7 (8617) 71-75-25'],
    emails: ['mail@nsma.ru']
  },
  socialLinks: [
    { label: 'ВКонтакте', url: 'https://vk.com/aumsu', icon: 'vk' },
    { label: 'Telegram', url: 'https://t.me/aumsu', icon: 'telegram' }
  ],
  quickLinks: [],
  externalServices: []
}

const enSite = {
  locale: 'en',
  siteUrl: 'https://aumsu.ru',
  siteName: 'Admiral Ushakov Maritime State University',
  shortName: 'AMSU',
  defaultSeo: {
    titleTemplate: '%s — Admiral Ushakov Maritime State University',
    description:
      'Official website of Admiral F.F. Ushakov State Maritime University',
    ogImage: '/media/og/default.jpg'
  },
  contacts: {
    address: '93 Prospekt Lenina, Novorossiysk, Krasnodar Krai, 353924, Russia',
    phones: ['+7 (8617) 71-75-25'],
    emails: ['mail@nsma.ru']
  },
  socialLinks: [
    { label: 'VK', url: 'https://vk.com/aumsu', icon: 'vk' },
    { label: 'Telegram', url: 'https://t.me/aumsu', icon: 'telegram' }
  ],
  quickLinks: [],
  externalServices: []
}

const sectionsRu = [
  { id: 'about', key: 'about', title: 'Университет', path: '/about', description: 'История, структура, руководство, сотрудники и документы.' },
  { id: 'admissions', key: 'admissions', title: 'Поступление', path: '/admissions', description: 'Уровни подготовки, правила, сроки, стоимость и подача документов.' },
  { id: 'education', key: 'education', title: 'Образование', path: '/education', description: 'Каталог программ, учебный процесс, библиотека и ДПО.' },
  { id: 'science', key: 'science', title: 'Наука', path: '/science', description: 'Направления, лаборатории, конференции и журналы.' },
  { id: 'student-life', key: 'student-life', title: 'Студенческая жизнь', path: '/student-life', description: 'События, культура, спорт, поддержка и карьера.' },
  { id: 'international', key: 'international', title: 'Международное сотрудничество', path: '/international', description: 'Иностранным студентам, партнёры и мобильность.' },
  { id: 'news', key: 'news', title: 'Новости', path: '/news', description: 'Лента событий университета и архив.' },
  { id: 'contacts', key: 'contacts', title: 'Контакты', path: '/contacts', description: 'Приёмная комиссия, справочник и обратная связь.' }
].map((item, index) => ({
  ...item,
  order: index + 1,
  visible: true,
  seo: { title: item.title, description: item.description },
  status: 'published'
}))

const sectionsEn = [
  { id: 'about', key: 'about', title: 'University', path: '/about', description: 'History, structure, leadership, staff and documents.' },
  { id: 'admissions', key: 'admissions', title: 'Admissions', path: '/admissions', description: 'Study levels, rules, deadlines, tuition and application.' },
  { id: 'education', key: 'education', title: 'Education', path: '/education', description: 'Programme catalogue, academic process, library and CPD.' },
  { id: 'science', key: 'science', title: 'Research', path: '/science', description: 'Research areas, laboratories, conferences and journals.' },
  { id: 'student-life', key: 'student-life', title: 'Student life', path: '/student-life', description: 'Events, culture, sport, support and careers.' },
  { id: 'international', key: 'international', title: 'International', path: '/international', description: 'International students, partners and mobility.' },
  { id: 'news', key: 'news', title: 'News', path: '/news', description: 'University news feed and archive.' },
  { id: 'contacts', key: 'contacts', title: 'Contacts', path: '/contacts', description: 'Admissions office, directory and feedback.' }
].map((item, index) => ({
  ...item,
  order: index + 1,
  visible: true,
  seo: { title: item.title, description: item.description },
  status: 'published'
}))

function mainNav(localeSections) {
  return localeSections.map((section) => ({
    id: section.id,
    title: section.title,
    path: section.path,
    visible: true,
    order: section.order
  }))
}

function navigation(localeSections) {
  return {
    main: mainNav(localeSections),
    utility: [
      { id: 'sveden', title: 'Сведения об образовательной организации', path: '/sveden', visible: true, order: 1 },
      { id: 'search', title: 'Поиск', path: '/search', visible: true, order: 2 },
      { id: 'sitemap', title: 'Карта сайта', path: '/sitemap', visible: true, order: 3 }
    ],
    footer: [
      { id: 'documents', title: 'Документы', path: '/about/documents', visible: true, order: 1 },
      { id: 'employees', title: 'Сотрудники', path: '/about/employees', visible: true, order: 2 },
      { id: 'phonebook', title: 'Телефонный справочник', path: '/contacts/phonebook', visible: true, order: 3 },
      { id: 'feedback', title: 'Обратная связь', path: '/contacts/feedback', visible: true, order: 4 },
      { id: 'sveden', title: 'Сведения об образовательной организации', path: '/sveden', visible: true, order: 5 },
      { id: 'sitemap', title: 'Карта сайта', path: '/sitemap', visible: true, order: 6 }
    ]
  }
}

const divisionsClassified = struct.departments.map((item, index) => {
  const lower = item.name.toLowerCase()
  let type = 'administration'
  let base = '/about/structure/administrations'
  if (lower.includes('факультет')) {
    type = 'faculty'
    base = '/about/structure/faculties'
  } else if (lower.startsWith('институт')) {
    type = 'institute'
    base = '/about/structure/institutes'
  } else if (lower.includes('колледж')) {
    type = 'college'
    base = '/about/structure/colleges'
  } else if (lower.includes('военный учебный центр')) {
    type = 'military-center'
    base = '/about/structure/military-center'
  } else if (lower.includes('навигацкая школа')) {
    type = 'college'
    base = '/about/structure/colleges'
  }
  const slug = slugify(item.name)
  return {
    ...item,
    id: `org-${index + 1}`,
    type,
    slug,
    path: type === 'military-center' ? base : `${base}/${slug}`
  }
})

const orgUnitMap = new Map(divisionsClassified.map((item) => [item.id, item]))

function facultyForProgram(program) {
  const code = program.code
  const level = program.level
  if (level.includes('Среднее')) {
    if (['09.02.07', '09.02.11', '38.02.03', '40.02.04', '34.02.01'].includes(code)) {
      return divisionsClassified.find((d) => d.name.includes('Транспортный колледж'))
    }
    return divisionsClassified.find((d) => d.name.includes('Морской колледж'))
  }
  if (code.startsWith('26.')) return divisionsClassified.find((d) => d.name.includes('Факультет эксплуатации'))
  if (code.startsWith('23.') || code.startsWith('15.') || code.startsWith('20.')) {
    return divisionsClassified.find((d) => d.name.includes('Судомеханический'))
  }
  return divisionsClassified.find((d) => d.name.includes('Институт морского'))
}

const levelMap = {
  'Среднее профессиональное образование': 'college',
  'Высшее образование - бакалавриат': 'bachelor',
  'Высшее образование - специалитет': 'specialist',
  'Высшее образование - магистратура': 'master',
  'Высшее образование - подготовка кадров высшей квалификации': 'graduate'
}

const levelLabelsRu = {
  college: 'СПО',
  bachelor: 'Бакалавриат',
  specialist: 'Специалитет',
  master: 'Магистратура',
  graduate: 'Аспирантура'
}

const levelLabelsEn = {
  college: 'Vocational',
  bachelor: "Bachelor's",
  specialist: "Specialist's",
  master: "Master's",
  graduate: 'Postgraduate'
}

function formsFor(form) {
  const result = []
  if (form.includes('очная')) result.push('full-time')
  if (form.includes('очно-заочная')) result.push('part-time')
  if (form.includes('заочная')) result.push('part-time')
  return result.length ? [...new Set(result)] : ['full-time']
}

function programSlug(program, index) {
  return `${program.code.replace(/\./g, '-')}-${slugify(program.name).slice(0, 58).replace(/-+$/, '')}-${index + 1}`
}

const enProgramNames = {
  'Информационные системы и программирование': 'Information Systems and Programming',
  'Разработка и управление программным обеспечением': 'Software Development and Management',
  'Мехатроника и робототехника (по отраслям)': 'Mechatronics and Robotics (by Industry)',
  'Экологическая безопасность природных комплексов': 'Environmental Safety of Natural Systems',
  'Организация перевозок и управление на транспорте (по видам)': 'Transport Operations and Management (by Mode)',
  'Техническая эксплуатация подъемно-транспортных, строительных, дорожных машин и оборудования (по отраслям)': 'Technical Operation of Lifting, Transport, Construction and Road Machinery (by Industry)',
  'Судовождение': 'Navigation',
  'Эксплуатация судовых энергетических установок': 'Operation of Marine Power Plants',
  'Сестринское дело': 'Nursing',
  'Операционная деятельность в логистике': 'Logistics Operations',
  'Юриспруденция': 'Law',
  'Информационные системы и технологии': 'Information Systems and Technologies',
  'Информационная безопасность': 'Information Security',
  'Мехатроника и робототехника': 'Mechatronics and Robotics',
  'Техносферная безопасность': 'Technosphere Safety',
  'Технология транспортных процессов': 'Transport Process Technology',
  'Эксплуатация транспортно-технологических машин и комплексов': 'Operation of Transport and Technological Machines and Complexes',
  'Управление водным транспортом и гидрографическое обеспечение судоходства': 'Water Transport Management and Hydrographic Support of Navigation',
  'Кораблестроение, океанотехника и системотехника объектов морской инфраструктуры': 'Shipbuilding, Ocean Engineering and Marine Infrastructure Systems',
  'Инженерно-экономическое обеспечение технологий и бизнес-процессов водного транспорта': 'Engineering and Economic Support of Water Transport Technologies and Business Processes',
  'Экономика': 'Economics',
  'Государственное и муниципальное управление': 'Public and Municipal Administration',
  'Наземные транспортно-технологические средства': 'Land Transport and Technological Means',
  'Техническая эксплуатация транспортного радиооборудования': 'Technical Operation of Transport Radio Equipment',
  'Эксплуатация судового электрооборудования и средств автоматики': 'Operation of Marine Electrical Equipment and Automation',
  'Таможенное дело': 'Customs Affairs',
  'Правовое обеспечение национальной безопасности': 'Legal Support of National Security',
  'Системы, сети и устройства телекоммуникаций': 'Telecommunication Systems, Networks and Devices',
  'Системный анализ, управление и обработка информации, статистика': 'System Analysis, Information Management and Processing, Statistics',
  'Автоматизация и управление технологическими процессами и производствами': 'Automation and Control of Technological Processes and Production',
  'Судовые энергетические установки и их элементы (главные и вспомогательные)': 'Marine Power Plants and Their Elements (Main and Auxiliary)',
  'Эксплуатация водного транспорта, водные пути сообщения и гидрография': 'Water Transport Operation, Waterways and Hydrography',
  'Интеллектуальные транспортные системы': 'Intelligent Transport Systems',
  'Экологическая безопасность': 'Environmental Safety',
  'Публично-правовые (государственно-правовые) науки': 'Public Law (State Law) Sciences',
  'Региональная и отраслевая экономика': 'Regional and Sectoral Economics',
  'Методология и технология профессионального образования': 'Methodology and Technology of Vocational Education'
}

function translateProgramName(name) {
  let result = name
  for (const [ru, en] of Object.entries(enProgramNames)) {
    if (result === ru) return en
    result = result.replace(ru, en)
  }
  result = result
    .replace(' - на базе основного общего образования', ' — based on basic general education')
    .replace(' - на базе среднего общего образования', ' — based on secondary general education')
    .replace(' (по отраслям)', ' (by industry)')
    .replace(' (по видам)', ' (by mode)')
  return result
}

function programRecords(locale) {
  const records = []
  education.programs.forEach((program, index) => {
    const level = levelMap[program.level] || 'bachelor'
    const faculty = facultyForProgram(program)
    const id = `program-${index + 1}`
    const slug = programSlug(program, index)
    const isEn = locale === 'en'
    const name = isEn ? translateProgramName(program.name) : program.name
    const budget = level === 'college' ? 25 + (index % 15) : 12 + (index % 40)
    const paid = level === 'college' ? 20 + (index % 20) : 10 + (index % 35)
    const price = level === 'college' ? 98000 + (index % 6) * 12000 : level === 'master' || level === 'graduate' ? 155000 + (index % 7) * 18000 : 142000 + (index % 8) * 16000
    const duration = level === 'college' ? '2 года 10 месяцев' : level === 'bachelor' || level === 'specialist' ? '4 года' : level === 'master' ? '2 года' : '3 года'
    const durationEn = level === 'college' ? '2 years 10 months' : level === 'bachelor' || level === 'specialist' ? '4 years' : level === 'master' ? '2 years' : '3 years'
    records.push({
      id,
      slug,
      status: 'published',
      locale,
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
      code: program.code,
      name,
      level,
      profile: program.profile && program.profile !== '-' ? program.profile : undefined,
      facultyId: faculty?.id || 'org-1',
      departmentIds: [],
      forms: formsFor(program.form),
      duration: isEn ? durationEn : duration,
      languages: ['ru'],
      budgetPlaces: budget,
      paidPlaces: paid,
      tuition: [
        { amount: price, currency: 'RUB', year: 2026, form: formsFor(program.form)[0] }
      ],
      description: [
        p(
          isEn
            ? `The programme prepares specialists in ${name.toLowerCase()} for the maritime and transport industry. Students gain practical skills in modern laboratories and training centres.`
            : `Программа готовит специалистов по направлению «${program.name}» для морской и транспортной отрасли. Практические навыки отрабатываются в современных лабораториях и учебно-тренажёрных центрах.`
        ),
        h(isEn ? 'What you will study' : 'Чему вы научитесь'),
        list(
          isEn
            ? ['Professional disciplines and applied projects', 'Work with industry digital tools', 'Teamwork and production practice', 'Safety and environmental standards']
            : ['Профильные дисциплины и прикладные проекты', 'Работа с цифровыми инструментами отрасли', 'Командная работа и производственная практика', 'Нормы безопасности и экологические стандарты']
        ),
        h(isEn ? 'Admission' : 'Поступление'),
        p(
          isEn
            ? `Entrance examinations depend on the chosen level. The minimum score and the number of places are updated annually by the admissions office.`
            : 'Вступительные испытания зависят от выбранного уровня. Минимальные баллы и количество мест ежегодно уточняются приёмной комиссией.'
        )
      ],
      curriculumDocumentIds: [],
      annotationDocumentIds: [],
      admission: {
        exams: [
          { subject: isEn ? 'Mathematics' : 'Математика', minScore: 39 },
          { subject: isEn ? 'Russian language' : 'Русский язык', minScore: 40 },
          { subject: isEn ? 'Profile subject' : 'Профильный предмет', minScore: 44 }
        ],
        budgetPlaces: budget,
        paidPlaces: paid,
        tuition: [{ amount: price, currency: 'RUB', year: 2026 }],
        deadlines: [
          { label: isEn ? 'Start of applications' : 'Начало приёма документов', date: '2026-06-20' },
          { label: isEn ? 'End of applications (budget)' : 'Окончание приёма (бюджет)', date: '2026-07-25' }
        ]
      },
      accreditation: isEn ? 'State accreditation' : 'Государственная аккредитация',
      seo: {
        title: (isEn ? `${translateProgramName(program.name)} — ${levelLabelsEn[level]}` : `${program.name} — ${levelLabelsRu[level]}`).slice(0, 60),
        description: (isEn
          ? `Programme ${program.code}: admission, duration, places and tuition at Admiral Ushakov Maritime State University.`
          : `Программа ${program.code}: поступление, срок обучения, места и стоимость в ГМУ им. адм. Ф.Ф. Ушакова.`).slice(0, 160)
      }
    })
  })
  return records
}

const divisionNameEn = {
  'Факультет эксплуатации водного транспорта и судовождения (ФЭВТиСВ)': 'Faculty of Water Transport Operation and Navigation (FWTON)',
  'Судомеханический факультет': 'Faculty of Marine Engineering',
  'Заочный факультет': 'Faculty of Distance Learning',
  'Военный учебный центр': 'Military Training Centre',
  'Институт морского транспортного менеджмента, экономики и права': 'Institute of Maritime Transport Management, Economics and Law',
  'Учебно-тренажёрный факультет': 'Training and Simulator Faculty',
  'Морской колледж': 'Maritime College',
  'Транспортный колледж': 'Transport College',
  'Навигацкая школа': 'Navigation School',
  'Управление экономики и планирования': 'Department of Economics and Planning',
  'Управление по организационно-строевой работе с курсантским составом': 'Department for Organisational and Cadet Affairs',
  'Аппарат ректора': "Rector's Office",
  'Управление финансового планирования и закупок': 'Department of Financial Planning and Procurement',
  'Управление по конвенционной и морской подготовке': 'Department of Convention and Maritime Training',
  'Управление воспитательной работы и молодежной политики': 'Department of Educational Work and Youth Policy',
  'Управление информационных технологий': 'Department of Information Technology',
  'Управление учебного процесса': 'Department of Academic Affairs',
  'Управление методической работы, внедрения новых образовательных технологий и международной деятельности': 'Department of Methodological Work, Educational Technologies and International Activities',
  'Управление по инвестиционному проектированию': 'Department of Investment Design',
  'Управление общих вопросов деятельности': 'Department of General Affairs',
  'Управление по персоналу и контролю': 'Department of Personnel and Control',
  'Управление внутренней безопасности': 'Department of Internal Security',
  'Юридический отдел': 'Legal Department',
  '2 отдел': 'Second Department',
  'Медико-санитарная санчасть': 'Medical Unit',
  'Организационно-строевой отдел': 'Organisational and Cadet Department',
  'Отдел документационного оборота': 'Document Management Department',
  'Архив': 'Archive',
  'Отдел кадров': 'Human Resources Department',
  'Отдел докторантуры и аспирантуры': 'Department of Doctoral and Postgraduate Studies',
  'Научно-исследовательский центр': 'Research Centre'
}

function orgUnitRecords(locale) {
  const isEn = locale === 'en'
  return divisionsClassified.map((item, index) => {
    const name = isEn ? divisionNameEn[item.name] || item.name : item.name
    return {
      id: item.id,
      type: item.type,
      slug: item.slug,
      name,
      shortName: isEn ? name : undefined,
      path: item.path,
      parentId: undefined,
      headTitle: item.post,
      description: [
        p(
          isEn
            ? `${name} is part of Admiral Ushakov Maritime State University. The unit coordinates education, research and administrative work in its area.`
            : `${item.name} — подразделение Государственного морского университета имени адмирала Ф.Ф. Ушакова. Подразделение координирует образовательную, научную и административную работу по своему направлению.`
        )
      ],
      address: item.address,
      phones: item.phones || [],
      emails: item.emails || [],
      siteUrl: item.site && !item.site.endsWith('#') ? item.site : undefined,
      workingHours: isEn ? 'Mon–Fri, 8:30–17:00' : 'Пн–Пт, 8:30–17:00',
      programIds: [],
      employeeIds: [],
      documentIds: [],
      regulationDocumentId: undefined,
      order: index + 1,
      status: 'published',
      locale,
      createdAt: now,
      updatedAt: now,
      seo: {
        title: name.slice(0, 60),
        description: (isEn ? `Contacts and information about ${name}.` : `${item.name}: контакты, руководитель, документы и направления работы.`).slice(0, 160)
      },
      head: item.head,
      headPost: item.post,
      regulationUrl: item.regulation?.url
    }
  })
}

const managerRecords = managersRaw.managers
  .filter((item) => item.fio && item.fio !== 'Ф.И.О')
  .map((item, index) => ({
    fio: item.fio,
    post: item.post,
    phones: item.phones || [],
    emails: item.emails || [],
    image: item.image,
    category: item.category,
    id: `manager-${index + 1}`,
    slug: slugify(item.fio)
  }))

const employeeSeedRecords = employeesRaw.employees.map((item, index) => ({
  ...item,
  id: `employee-${index + 1}`,
  slug: slugify(item.fio),
  isManager: false,
  order: index + 1
}))

const allPeople = [
  ...managerRecords.map((item, index) => ({
    ...item,
    id: `employee-manager-${index + 1}`,
    isManager: true,
    order: index + 1
  })),
  ...employeeSeedRecords
]

function uniqueBySlug(items) {
  const map = new Map()
  for (const item of items) {
    let slug = item.slug || slugify(item.fio || item.name || item.id)
    if (!slug) slug = item.id
    let candidate = slug
    let counter = 2
    while (map.has(candidate)) candidate = `${slug}-${counter++}`
    map.set(candidate, { ...item, slug: candidate })
  }
  return [...map.values()]
}

const people = uniqueBySlug(allPeople)

const rector = people.find((item) => item.fio.includes('Кондратьев Сергей'))

function employeeRecords(locale) {
  const isEn = locale === 'en'
  return people.map((item) => ({
    id: item.id,
    slug: item.slug,
    fullName: item.fio,
    displayName: item.fio,
    position: item.post,
    degree: item.degree,
    academicTitle: item.academicTitle,
    departmentId: undefined,
    unitIds: [],
    emails: item.emails || [],
    phones: item.phones || [],
    office: undefined,
    photoId: undefined,
    photoUrl: item.image,
    bio: [
      p(
        isEn
          ? 'Personal data is published in accordance with consent. Contact details are provided by the relevant department.'
          : 'Персональные данные публикуются при наличии согласия. Контактные данные предоставляются соответствующим подразделением.'
      )
    ],
    disciplines: (item.disciplines || []).slice(0, 10),
    education: item.educationLevel ? [item.educationLevel] : [],
    qualifications: item.qualifications || [],
    experienceYears: item.experience ? Number(item.experience) : undefined,
    isManager: Boolean(item.isManager),
    managerCategory: item.isManager ? (item.post.toLowerCase().includes('ректор') ? 'rector' : 'vice-rector') : undefined,
    order: item.order,
    status: 'published',
    locale,
    createdAt: now,
    updatedAt: now,
    seo: {
      title: `${item.fio} — ${item.post}`.slice(0, 60),
      description: `${item.fio}, ${item.post}. Контакты и сведения о сотруднике ГМУ им. адм. Ф.Ф. Ушакова.`.slice(0, 160)
    }
  }))
}

const newsBase = [
  {
    slug: 'priemnaya-kampaniya-2026',
    title: 'Стартовала приёмная кампания 2026 года',
    titleEn: 'The 2026 admissions campaign has started',
    summary: 'Приём документов открыт на все уровни подготовки: от СПО до аспирантуры. Узнайте сроки, документы и порядок подачи заявления.',
    summaryEn: 'Applications are open at all study levels, from vocational programmes to postgraduate study. Check deadlines, documents and the application procedure.',
    category: 'priemnaya-kampaniya',
    date: '2026-06-20T08:00:00.000Z',
    body: [
      p('20 июня Государственный морской университет имени адмирала Ф.Ф. Ушакова открыл приём документов на 2026/2027 учебный год. Заявления принимаются на бакалавриат, специалитет, магистратуру, программы среднего профессионального образования и аспирантуру.'),
      h('Как подать документы'),
      list(['Через личный кабинет абитуриента — основной способ.', 'Лично в приёмной комиссии по адресу: проспект Ленина, 93.', 'Через операторов почтовой связи при соблюдении требований к оформлению.']),
      callout('info', 'Важно', 'Перед подачей заявления проверьте перечень вступительных испытаний и индивидуальных достижений на странице выбранной программы.'),
      p('Приёмная комиссия работает ежедневно, включая выходные в период приёмной кампании. Телефон: +7 (8617) 71-75-25.')
    ],
    bodyEn: [
      p('On 20 June, Admiral Ushakov State Maritime University opened applications for the 2026/2027 academic year. Applications are accepted for bachelor, specialist, master, vocational and postgraduate programmes.'),
      h('How to apply'),
      list(['Through the applicant portal — the main route.', 'In person at the admissions office, 93 Prospekt Lenina.', 'By post, subject to document requirements.']),
      callout('info', 'Important', 'Before applying, check the entrance examinations and individual achievements for your chosen programme.'),
      p('The admissions office is open every day during the campaign. Phone: +7 (8617) 71-75-25.')
    ]
  },
  {
    slug: 'den-otkrytyh-dverej-2026',
    title: 'День открытых дверей пройдёт 25 октября',
    titleEn: 'Open Day on 25 October',
    summary: 'Познакомьтесь с факультетами и институтами, увидите лаборатории и тренажёрные комплексы, задайте вопросы приёмной комиссии.',
    summaryEn: 'Meet the faculties and institutes, see the laboratories and training centres, and ask the admissions office your questions.',
    category: 'priemnaya-kampaniya',
    date: '2026-10-12T10:00:00.000Z',
    body: [
      p('25 октября в главном корпусе университета пройдёт День открытых дверей. Начало в 10:00. Гостей ждут презентации направлений подготовки, экскурсии по лабораториям и встреча с руководством университета.'),
      h('Программа'),
      list(['10:00 — регистрация и welcome-зона.', '10:30 — презентация университета.', '11:30 — встречи с факультетами и институтами.', '12:30 — экскурсии по кампусу и тренажёрным классам.']),
      p('Для участия нужна предварительная регистрация. Ссылка появится на главной странице и в разделе «Поступление».')
    ],
    bodyEn: [
      p('On 25 October the university will hold an Open Day in the main building. The event starts at 10:00. Guests will enjoy programme presentations, laboratory tours and a meeting with the university leadership.'),
      h('Programme'),
      list(['10:00 — registration and welcome area.', '10:30 — university presentation.', '11:30 — meetings with faculties and institutes.', '12:30 — campus and training centre tours.']),
      p('Pre-registration is required. The link will appear on the home page and in the Admissions section.')
    ]
  },
  {
    slug: 'laboratoriya-cifrovoj-navigacii',
    title: 'Открыта лаборатория цифровой навигации',
    titleEn: 'Digital Navigation Laboratory opened',
    summary: 'Новая площадка объединяет тренажёры ECDIS, моделирование маршрутов и исследования в области интеллектуальных транспортных систем.',
    summaryEn: 'The new facility combines ECDIS simulators, route modelling and research in intelligent transport systems.',
    category: 'nauka',
    date: '2026-10-05T09:00:00.000Z',
    body: [
      p('В университете открылась лаборатория цифровой навигации. Она предназначена для подготовки курсантов и проведения прикладных исследований в области интеллектуальных транспортных систем.'),
      h('Что внутри'),
      list(['Тренажёры ECDIS и интегрированного ходового мостика.', 'Программные комплексы моделирования маршрутов.', 'Рабочие места для анализа данных о движении судов.']),
      p('Лаборатория используется в образовательных программах по судовождению и управлению водным транспортом, а также для совместных проектов с отраслевыми партнёрами.')
    ],
    bodyEn: [
      p('A digital navigation laboratory has opened at the university. It supports cadet training and applied research in intelligent transport systems.'),
      h('Facilities'),
      list(['ECDIS and integrated bridge simulators.', 'Route modelling software.', 'Workstations for vessel traffic data analysis.']),
      p('The laboratory is used in navigation and water transport management programmes and in joint projects with industry partners.')
    ]
  },
  {
    slug: 'konferenciya-morskie-tehnologii',
    title: 'Морские технологии: университет провёл научную конференцию',
    titleEn: 'Maritime Technologies: university hosts research conference',
    summary: 'Исследователи обсудили цифровизацию судоходства, экологическую безопасность и подготовку инженерных кадров.',
    summaryEn: 'Researchers discussed digitalisation of shipping, environmental safety and engineering education.',
    category: 'nauka',
    date: '2026-09-28T09:00:00.000Z',
    body: [
      p('В Новороссийске прошла международная научно-практическая конференция «Морские технологии и устойчивое развитие транспорта». В ней приняли участие представители вузов, судоходных компаний и отраслевых ассоциаций.'),
      h('Ключевые темы'),
      list(['Цифровые двойники судов и портов.', 'Снижение выбросов и зелёная энергетика.', 'Подготовка кадров для автономного судоходства.', 'Кибербезопасность морских систем.']),
      p('Материалы конференции будут опубликованы в сборнике и доступны в разделе «Наука».')
    ],
    bodyEn: [
      p('The international research conference “Maritime Technologies and Sustainable Transport” took place in Novorossiysk, bringing together universities, shipping companies and industry associations.'),
      h('Key topics'),
      list(['Digital twins of ships and ports.', 'Emissions reduction and green energy.', 'Training for autonomous shipping.', 'Cybersecurity of maritime systems.']),
      p('Conference materials will be published in the proceedings and made available in the Research section.')
    ]
  },
  {
    slug: 'pobeda-na-olimpiade',
    title: 'Курсанты Ушаковки победили на международной олимпиаде',
    titleEn: 'Ushakovka cadets win international olympiad',
    summary: 'Команда университета заняла первое место в командном зачёте по морскому делу и судовождению.',
    summaryEn: 'The university team took first place in the team event in maritime affairs and navigation.',
    category: 'student-life',
    date: '2026-09-15T14:00:00.000Z',
    body: [
      p('Команда курсантов Государственного морского университета имени адмирала Ф.Ф. Ушакова заняла первое место на международной олимпиаде по морскому делу. Соревнования включали навигационную прокладку, знание правил предупреждения столкновений судов и работу на тренажёрах.'),
      p('Поздравляем участников и их наставников с победой!')
    ],
    bodyEn: [
      p('A team of cadets from Admiral Ushakov State Maritime University took first place at the international maritime olympiad. The competition included navigation plotting, collision regulations and simulator tasks.'),
      p('Congratulations to the participants and their mentors!')
    ]
  },
  {
    slug: 'regata-ushakovka',
    title: 'Парусная регата собрала курсантов и выпускников',
    titleEn: 'Sailing regatta brings together cadets and alumni',
    summary: 'Традиционная регата прошла в акватории Новороссийска. В гонках участвовали экипажи университета и выпускники разных лет.',
    summaryEn: 'The traditional regatta took place in Novorossiysk waters with crews from the university and alumni of different years.',
    category: 'student-life',
    date: '2026-09-08T08:00:00.000Z',
    body: [
      p('В акватории Новороссийска прошла традиционная парусная регата университета. В соревнованиях приняли участие курсанты, преподаватели и выпускники.'),
      p('Победители и призёры награждены кубками и памятными медалями. Следующая регата запланирована на весну 2027 года.')
    ],
    bodyEn: [
      p('The university’s traditional sailing regatta took place in the waters of Novorossiysk, with cadets, teachers and alumni competing.'),
      p('Winners received cups and commemorative medals. The next regatta is planned for spring 2027.')
    ]
  },
  {
    slug: 'partnerstvo-kitaj',
    title: 'Университет расширяет сотрудничество с вузами Китая',
    titleEn: 'University expands cooperation with Chinese institutions',
    summary: 'Подписаны соглашения об академическом обмене и совместных программах в области логистики и морского инжиниринга.',
    summaryEn: 'Agreements on academic exchange and joint programmes in logistics and marine engineering have been signed.',
    category: 'mezhdunarodnoe',
    date: '2026-08-30T11:00:00.000Z',
    body: [
      p('ГМУ им. адм. Ф.Ф. Ушакова подписал соглашения о сотрудничестве с двумя университетами Китая. Документы предусматривают академический обмен, стажировки преподавателей и совместные исследования.'),
      p('Стороны планируют запустить совместные модули по логистике и морскому инжинирингу уже в следующем учебном году.')
    ],
    bodyEn: [
      p('Admiral Ushakov State Maritime University signed cooperation agreements with two Chinese universities. The documents provide for academic exchange, staff internships and joint research.'),
      p('The parties plan to launch joint modules in logistics and marine engineering in the next academic year.')
    ]
  },
  {
    slug: 'vstrecha-vypusknikov',
    title: 'Встреча выпускников: 50 лет морским традициям',
    titleEn: 'Alumni reunion: 50 years of maritime tradition',
    summary: 'Выпускники разных лет вернулись в родной университет, чтобы встретиться с преподавателями и студентами.',
    summaryEn: 'Alumni of different years returned to their university to meet teachers and students.',
    category: 'universitet',
    date: '2026-08-20T12:00:00.000Z',
    body: [
      p('В университете прошла ежегодная встреча выпускников. Гости посетили обновлённые лаборатории, музей и учебные аудитории, а также приняли участие в круглом столе о развитии морского образования.'),
      p('Выпускники отметили важность наставничества и предложили программы стажировок для студентов старших курсов.')
    ],
    bodyEn: [
      p('The university hosted its annual alumni reunion. Guests visited the renovated laboratories, museum and classrooms and joined a round table on the development of maritime education.'),
      p('Alumni highlighted the importance of mentoring and proposed internship programmes for senior students.')
    ]
  },
  {
    slug: 'novyj-trenazhernyj-kompleks',
    title: 'Учебно-тренажёрный комплекс обновил оборудование',
    titleEn: 'Training centre upgrades its equipment',
    summary: 'Установлены новые тренажёры машинного отделения и системы виртуальной реальности для отработки аварийных процедур.',
    summaryEn: 'New engine room simulators and virtual reality systems have been installed for emergency procedure training.',
    category: 'universitet',
    date: '2026-08-10T09:00:00.000Z',
    body: [
      p('Учебно-тренажёрный комплекс университета получил новое оборудование. Обновлены тренажёры машинного отделения и добавлены сценарии виртуальной реальности для отработки действий в нештатных ситуациях.'),
      p('Обновление позволит приблизить подготовку курсантов к реальным условиям работы на судне.')
    ],
    bodyEn: [
      p('The university training centre has received new equipment. Engine room simulators have been upgraded and virtual reality scenarios added for emergency response training.'),
      p('The upgrade will bring cadet training closer to real shipboard conditions.')
    ]
  },
  {
    slug: 'stipendii-i-mery-podderzhki',
    title: 'Обновлены правила назначения стипендий',
    titleEn: 'Scholarship rules updated',
    summary: 'В новом учебном году увеличены отдельные виды стипендий и уточнены условия для студентов первого курса.',
    summaryEn: 'Some scholarship types have been increased and conditions for first-year students clarified.',
    category: 'student-life',
    date: '2026-08-01T10:00:00.000Z',
    body: [
      p('С 1 сентября 2026 года действуют обновлённые правила назначения стипендий и мер социальной поддержки. С информацией можно ознакомиться в разделе «Студенческая жизнь».'),
      p('Заявления принимаются в деканатах и в управлении воспитательной работы.')
    ],
    bodyEn: [
      p('Updated rules for scholarships and social support apply from 1 September 2026. Details are available in the Student Life section.'),
      p('Applications are accepted at the faculties and the student affairs office.')
    ]
  }
]

const categoriesRu = [
  { id: 'universitet', slug: 'universitet', title: 'Университет', order: 1 },
  { id: 'nauka', slug: 'nauka', title: 'Наука', order: 2 },
  { id: 'obrazovanie', slug: 'obrazovanie', title: 'Образование', order: 3 },
  { id: 'student-life', slug: 'student-life', title: 'Студенческая жизнь', order: 4 },
  { id: 'mezhdunarodnoe', slug: 'mezhdunarodnoe', title: 'Международное', order: 5 },
  { id: 'priemnaya-kampaniya', slug: 'priemnaya-kampaniya', title: 'Приёмная кампания', order: 6 },
  { id: 'sport', slug: 'sport', title: 'Спорт', order: 7 },
  { id: 'kultura', slug: 'kultura', title: 'Культура', order: 8 }
]

const categoriesEn = [
  { id: 'universitet', slug: 'university', title: 'University', order: 1 },
  { id: 'nauka', slug: 'research', title: 'Research', order: 2 },
  { id: 'obrazovanie', slug: 'education', title: 'Education', order: 3 },
  { id: 'student-life', slug: 'student-life', title: 'Student life', order: 4 },
  { id: 'mezhdunarodnoe', slug: 'international', title: 'International', order: 5 },
  { id: 'priemnaya-kampaniya', slug: 'admissions', title: 'Admissions', order: 6 },
  { id: 'sport', slug: 'sport', title: 'Sport', order: 7 },
  { id: 'kultura', slug: 'culture', title: 'Culture', order: 8 }
]

function newsRecords(locale) {
  const isEn = locale === 'en'
  return newsBase.map((item, index) => ({
    id: `news-${index + 1}`,
    slug: item.slug,
    status: 'published',
    locale,
    createdAt: now,
    updatedAt: item.date,
    publishedAt: item.date,
    title: isEn ? item.titleEn : item.title,
    summary: isEn ? item.summaryEn : item.summary,
    body: isEn ? item.bodyEn : item.body,
    coverId: undefined,
    categoryIds: [item.category],
    tagIds: [],
    audiences: [],
    eventDate: undefined,
    location: undefined,
    authorId: undefined,
    relatedIds: [],
    seo: {
      title: (isEn ? item.titleEn : item.title).slice(0, 60),
      description: (isEn ? item.summaryEn : item.summary).slice(0, 160)
    }
  }))
}

const eventsBase = [
  { slug: 'den-otkrytyh-dverej', title: 'День открытых дверей', titleEn: 'Open Day', summary: 'Презентация направлений, экскурсии по лабораториям и встреча с приёмной комиссией.', summaryEn: 'Programme presentations, laboratory tours and a meeting with the admissions office.', start: '2026-10-25T10:00:00.000Z', location: 'Главный корпус, пр. Ленина, 93', locationEn: 'Main building, 93 Prospekt Lenina', category: 'приёмная кампания' },
  { slug: 'morskie-tehnologii-2026', title: 'Конференция «Морские технологии»', titleEn: 'Maritime Technologies Conference', summary: 'Научная конференция о цифровизации судоходства и устойчивом развитии транспорта.', summaryEn: 'Research conference on digital shipping and sustainable transport.', start: '2026-11-12T09:00:00.000Z', location: 'Конференц-зал, УЛК №2', locationEn: 'Conference hall, ULK 2', category: 'наука' },
  { slug: 'den-karery', title: 'День карьеры', titleEn: 'Career Day', summary: 'Встречи с работодателями, стажировки и вакансии для студентов и выпускников.', summaryEn: 'Meetings with employers, internships and vacancies for students and alumni.', start: '2026-11-20T11:00:00.000Z', location: 'Учебный корпус №1', locationEn: 'Academic building 1', category: 'карьера' },
  { slug: 'nauchnyj-slam', title: 'Science Slam Ушаковки', titleEn: 'Ushakovka Science Slam', summary: 'Молодые исследователи рассказывают о своих проектах за 10 минут.', summaryEn: 'Young researchers present their projects in ten minutes.', start: '2026-12-03T18:00:00.000Z', location: 'Актовый зал', locationEn: 'Assembly hall', category: 'наука' },
  { slug: 'novogodnij-koncert', title: 'Новогодний концерт', titleEn: 'New Year concert', summary: 'Праздничный концерт творческих коллективов университета.', summaryEn: 'Festive concert by university creative groups.', start: '2026-12-20T17:00:00.000Z', location: 'Актовый зал', locationEn: 'Assembly hall', category: 'культура' }
]

function eventRecords(locale) {
  const isEn = locale === 'en'
  return eventsBase.map((item, index) => ({
    id: `event-${index + 1}`,
    slug: item.slug,
    status: 'published',
    locale,
    createdAt: now,
    updatedAt: now,
    title: isEn ? item.titleEn : item.title,
    summary: isEn ? item.summaryEn : item.summary,
    body: [p(isEn ? item.summaryEn : item.summary)],
    startAt: item.start,
    endAt: undefined,
    location: isEn ? item.locationEn : item.location,
    category: item.category,
    coverId: undefined,
    registrationUrl: undefined,
    orgUnitIds: [],
    seo: {
      title: (isEn ? item.titleEn : item.title).slice(0, 60),
      description: (isEn ? item.summaryEn : item.summary).slice(0, 160)
    }
  }))
}

const documentSeeds = [
  ['Устав университета', 'Устав ФГБОУ ВО «ГМУ им. адм. Ф.Ф. Ушакова»', 'https://aumsu.ru/images/documents/ustav_23.7.14.pdf', 'Устав', '2024-01-10'],
  ['Лицензия на образовательную деятельность', 'Лицензия с приложениями', 'https://aumsu.ru/images/documents/Licenziya.pdf', 'Лицензии и аккредитации', '2025-04-20'],
  ['Правила приёма ВО', 'Правила приёма на программы высшего образования', 'https://aumsu.ru/images/PK/Priem_komis_page/Pravila_priema_2025.pdf', 'Приёмная кампания', '2025-06-01'],
  ['Правила приёма СПО', 'Правила приёма на программы среднего профессионального образования', 'https://aumsu.ru/images/PK/Priem_komis_page/spo_info/Pravila_priema_SPO.pdf', 'Приёмная кампания', '2025-06-01'],
  ['План приёма ВО 2025', 'Количество мест по направлениям подготовки', 'https://aumsu.ru/images/PK/Priem_komis_page/Plan_priema_VO_2025.pdf', 'Приёмная кампания', '2025-05-15'],
  ['Стоимость обучения ВО', 'Стоимость обучения по программам высшего образования', 'https://aumsu.ru/images/PK/Priem_komis_page/Spec_and_bak_info/Education_price_vo.pdf', 'Стоимость обучения', '2025-06-01'],
  ['Стоимость обучения СПО', 'Стоимость обучения по программам СПО', 'https://aumsu.ru/images/PK/Priem_komis_page/spo_info/stoimost_spo.pdf', 'Стоимость обучения', '2025-06-01'],
  ['Стоимость обучения магистратура', 'Стоимость обучения по программам магистратуры', 'https://aumsu.ru/images/PK/Priem_komis_page/Education_price_mag.pdf', 'Стоимость обучения', '2025-06-01'],
  ['Положение об институте', 'Типовое положение о структурном подразделении', 'https://aumsu.ru/images/education/Polojeniya/polojenie_ob_institute.pdf', 'Локальные акты', '2024-09-01'],
  ['Положение о морском колледже', 'Положение о структурном подразделении', 'https://aumsu.ru/images/education/Polojeniya/polojenie_o_mk.pdf', 'Локальные акты', '2024-09-01'],
  ['Положение о транспортном колледже', 'Положение о структурном подразделении', 'https://aumsu.ru/images/education/Polojeniya/polojenie_o_tk.pdf', 'Локальные акты', '2024-09-01'],
  ['Положение о военном учебном центре', 'Положение о военном учебном центре', 'https://aumsu.ru/images/education/Polojeniya/VUC.pdf', 'Локальные акты', '2024-09-01'],
  ['Правила приёма в аспирантуру', 'Правила приёма на программы подготовки кадров высшей квалификации', 'https://aumsu.ru/images/aspirantura/schedule/PravilaPriema_asp2025_2026.pdf', 'Аспирантура', '2025-06-01'],
  ['Перечень специальностей по лицензии', 'Специальности и направления, объявленные к приёму', 'https://aumsu.ru/images/PK/Priem_komis_page/spo_info/Pere4en_spec.pdf', 'Приёмная кампания', '2025-05-15'],
  ['Политика обработки персональных данных', 'Политика в отношении обработки персональных данных', 'https://aumsu.ru/images/documents/politika_pd.pdf', 'Правовые документы', '2025-01-01']
]

const manualDocumentUrls = new Set(documentSeeds.map((item) => item[2]))
const extraDocumentSeeds = []
const extraCategoryLimits = {
  'Устав': 2,
  'Лицензии и аккредитации': 8,
  'Приёмная кампания': 15,
  'Стоимость обучения': 6,
  'Стипендии и поддержка': 5,
  'Общежитие': 4,
  'Образовательные программы': 12,
  'Противодействие коррупции': 4,
  'Охрана труда': 4,
  'Вакантные места': 3,
  'Финансовая деятельность': 5,
  'Локальные акты': 15
}
const extraCategoryCounts = {}
const extraSeenTitles = new Set()
const extraItems = documentsRaw.documents
  .filter((item) => {
    if (!item.text || !item.url || manualDocumentUrls.has(item.url)) return false
    const text = item.text.replace(/\s+/g, ' ').trim()
    if (text.length < 10) return false
    if (/^[\d\s.,:;()/-]+$/.test(text)) return false
    if (/^пкпкпк$/i.test(text)) return false
    if (/протокол/i.test(text)) return false
    return true
  })
  .map((item) => {
    const text = item.text.replace(/\s+/g, ' ').trim().slice(0, 160)
    const lower = text.toLowerCase()
    let category = ''
    if (/устав/.test(lower)) category = 'Устав'
    else if (/лиценз|аккредит|свидетельств|реестр/.test(lower)) category = 'Лицензии и аккредитации'
    else if (/правил.*прием|правила приема|план.*прием|перечень.*специальн|целев|согласие|договор.*(абитур|прием)/.test(lower)) category = 'Приёмная кампания'
    else if (/стоимост|оплат/.test(lower)) category = 'Стоимость обучения'
    else if (/стипенд|поддержк/.test(lower)) category = 'Стипендии и поддержка'
    else if (/общежит/.test(lower)) category = 'Общежитие'
    else if (/учебн.*план|рабоч.*программ|образовательн.*программ|аннотац/.test(lower)) category = 'Образовательные программы'
    else if (/коррупц/.test(lower)) category = 'Противодействие коррупции'
    else if (/охрана труда|безопасност/.test(lower)) category = 'Охрана труда'
    else if (/вакант/.test(lower)) category = 'Вакантные места'
    else if (/бухгалтер|финанс|бюджет|отчет|отчёт|план.*финанс/.test(lower)) category = 'Финансовая деятельность'
    else if (/положен|приказ|инструкц|локальн|правил/.test(lower)) category = 'Локальные акты'
    return { item, text, category }
  })
  .filter(({ text, category }) => {
    if (!category) return false
    const titleKey = text.toLowerCase().slice(0, 110)
    if (extraSeenTitles.has(titleKey)) return false
    const count = extraCategoryCounts[category] || 0
    if (count >= (extraCategoryLimits[category] || 0)) return false
    extraSeenTitles.add(titleKey)
    extraCategoryCounts[category] = count + 1
    return true
  })

for (const { item, text, category } of extraItems) {
  const year = (item.url.match(/(20\d{2})/) || [])[1] || (text.match(/(20\d{2})/) || [])[1]
  extraDocumentSeeds.push([
    text,
    (item.sections || []).filter(Boolean).join(', ') || 'Официальный документ университета',
    item.url,
    category,
    year ? `${year}-01-01` : undefined
  ])
}

const allDocumentSeeds = [...documentSeeds, ...extraDocumentSeeds]

function documentRecords(locale) {
  const isEn = locale === 'en'
  return allDocumentSeeds.map((item, index) => ({
    id: `document-${index + 1}`,
    slug: slugify(item[0]),
    status: 'published',
    locale,
    createdAt: now,
    updatedAt: now,
    title: isEn ? item[0] : item[0],
    description: isEn ? `Official document: ${item[0]}.` : item[1],
    url: item[2],
    category: isEn ? 'Official documents' : item[3],
    publishedAt: item[4],
    isMandatory: index < 6,
    seo: {
      title: item[0].slice(0, 60),
      description: item[1].slice(0, 160)
    }
  }))
}

const contacts = {
  ru: [
    { id: 'admissions', title: 'Приёмная комиссия', address: 'г. Новороссийск, проспект Ленина, 93', phones: ['+7 (8617) 71-75-25'], emails: ['pcom@nsma.ru'], workingHours: 'Пн–Пт 8:30–17:00, в период приёмной кампании — ежедневно', order: 1 },
    { id: 'rectorate', title: 'Ректорат', address: 'г. Новороссийск, проспект Ленина, 93', phones: ['+7 (8617) 76-78-00'], emails: ['mail@nsma.ru'], workingHours: 'Пн–Пт 8:30–17:00', order: 2 },
    { id: 'international', title: 'Управление международной деятельности', address: 'г. Новороссийск, проспект Ленина, 93', phones: ['+7 (8617) 76-78-10'], emails: ['international@nsma.ru'], workingHours: 'Пн–Пт 8:30–17:00', order: 3 }
  ],
  en: [
    { id: 'admissions', title: 'Admissions Office', address: '93 Prospekt Lenina, Novorossiysk', phones: ['+7 (8617) 71-75-25'], emails: ['pcom@nsma.ru'], workingHours: 'Mon–Fri 8:30–17:00; daily during the admissions campaign', order: 1 },
    { id: 'rectorate', title: 'Rector’s Office', address: '93 Prospekt Lenina, Novorossiysk', phones: ['+7 (8617) 76-78-00'], emails: ['mail@nsma.ru'], workingHours: 'Mon–Fri 8:30–17:00', order: 2 },
    { id: 'international', title: 'International Office', address: '93 Prospekt Lenina, Novorossiysk', phones: ['+7 (8617) 76-78-10'], emails: ['international@nsma.ru'], workingHours: 'Mon–Fri 8:30–17:00', order: 3 }
  ]
}

const faqRu = [
  ['Как подать документы в университет?', 'Основной способ — личный кабинет абитуриента. Также можно подать документы лично в приёмной комиссии или по почте. Перед подачей проверьте перечень документов и вступительных испытаний.'],
  ['Какие сроки приёма документов в 2026 году?', 'Приём начинается 20 июня. Сроки окончания зависят от уровня подготовки и формы обучения. Актуальные даты опубликованы в разделе «Поступление → Сроки и этапы».'],
  ['Можно ли подать документы на несколько направлений?', 'Да, если это предусмотрено правилами приёма. Одновременно можно участвовать в конкурсе по нескольким направлениям и формам обучения в пределах установленных ограничений.'],
  ['Учитываются ли индивидуальные достижения?', 'Да. Победители олимпиад, спортсмены и волонтёры могут получить дополнительные баллы. Полный перечень и порядок подтверждения опубликованы в правилах приёма.'],
  ['Есть ли общежитие для иногородних студентов?', 'Да, университет предоставляет общежитие. Информация о стоимости, правилах заселения и документах находится в разделе «Поступление → Общежитие».'],
  ['Как узнать стоимость обучения?', 'Стоимость зависит от уровня подготовки, направления и формы обучения. Актуальные документы опубликованы в разделе «Стоимость обучения».'],
  ['Можно ли поступить иностранному гражданину?', 'Да. Для иностранных абитуриентов действуют отдельные правила и сроки. Информация собрана в разделе «Поступление → Иностранцам» и «Международное сотрудничество».'],
  ['Какие вступительные испытания меня ждут?', 'Перечень испытаний зависит от направления. Для школьников это обычно результаты ЕГЭ, для выпускников СПО и вузов возможны внутренние экзамены.'],
  ['Где узнать расписание занятий?', 'Актуальное расписание публикуется в разделе «Образование → Расписание занятий» и в личном кабинете студента.'],
  ['Как связаться с приёмной комиссией?', 'Телефон: +7 (8617) 71-75-25, email: pcom@nsma.ru. Адрес: г. Новороссийск, проспект Ленина, 93.']
]

const faqEn = [
  ['How do I apply?', 'The main route is the applicant portal. You can also apply in person at the admissions office or by post. Check the document list and entrance examinations before applying.'],
  ['What are the 2026 application deadlines?', 'Applications open on 20 June. Closing dates depend on the study level and form. Current dates are published in Admissions → Dates.'],
  ['Can I apply for several programmes?', 'Yes, where permitted by the admission rules. You may compete for several programmes and study forms within the established limits.'],
  ['Are individual achievements considered?', 'Yes. Olympiad winners, athletes and volunteers may receive additional points. The full list and confirmation rules are published in the admission rules.'],
  ['Is accommodation available?', 'Yes, the university provides dormitory accommodation. See Admissions → Dormitory for prices, check-in rules and documents.'],
  ['How can I find the tuition fee?', 'Tuition depends on the level, programme and study form. Current documents are published in the Tuition section.'],
  ['Can international citizens apply?', 'Yes. Separate rules and deadlines apply to international applicants. See Admissions → International and the International section.'],
  ['What entrance examinations will I take?', 'The list depends on the programme. School leavers usually submit Unified State Exam results; vocational and university graduates may take internal exams.'],
  ['Where is the timetable?', 'The current timetable is published in Education → Timetable and in the student portal.'],
  ['How do I contact the admissions office?', 'Phone: +7 (8617) 71-75-25, email: pcom@nsma.ru. Address: 93 Prospekt Lenina, Novorossiysk.']
]

function faqRecords(locale) {
  const source = locale === 'en' ? faqEn : faqRu
  return source.map((item, index) => ({
    id: `faq-${index + 1}`,
    question: item[0],
    answer: [p(item[1])],
    category: locale === 'en' ? 'Admissions' : 'Поступление',
    order: index + 1,
    status: 'published'
  }))
}

const externalServices = [
  { key: 'lkabit', title: 'Личный кабинет абитуриента', titleEn: 'Applicant portal', url: 'https://lkabit.aumsu.ru:98/', external: true, embed: false },
  { key: 'lkstudent', title: 'Личный кабинет студента', titleEn: 'Student portal', url: 'https://lk.aumsu.ru/', external: true, embed: false },
  { key: 'portal', title: 'Образовательный портал', titleEn: 'Learning portal', url: 'https://edu.aumsu.ru/', external: true, embed: false },
  { key: 'schedule', title: 'Расписание занятий', titleEn: 'Timetable', url: 'https://conference.aumsu.ru/', external: true, embed: true, embedKind: 'iframe', fallbackUrl: 'https://conference.aumsu.ru/' },
  { key: 'payment', title: 'Оплата обучения', titleEn: 'Tuition payment', url: 'https://pay.aumsu.ru/', external: true, embed: false },
  { key: 'library', title: 'Электронная библиотека', titleEn: 'Digital library', url: 'https://library.aumsu.ru/', external: true, embed: false },
  { key: 'tour', title: 'Виртуальный тур', titleEn: 'Virtual tour', url: 'https://aumsu.ru/', external: true, embed: true, embedKind: 'iframe', fallbackUrl: 'https://aumsu.ru/' },
  { key: 'map', title: 'Карта и схема проезда', titleEn: 'Map and directions', url: 'https://yandex.ru/maps/?text=Новороссийск%2C%20проспект%20Ленина%2C%2093', external: true, embed: true, embedKind: 'iframe', embedUrl: '/map.html', fallbackUrl: 'https://yandex.ru/maps/?text=Новороссийск%2C%20проспект%20Ленина%2C%2093' }
]

function pageRecord(locale, spec, index) {
  const isEn = locale === 'en'
  const title = isEn ? spec.enTitle || spec.title : spec.title
  const summary = isEn ? spec.enSummary || spec.summary : spec.summary
  return {
    id: `${locale}-page-${index + 1}`,
    slug: slugify(spec.path === '/' ? 'home' : spec.path.split('/').filter(Boolean).pop()),
    status: 'published',
    locale,
    createdAt: now,
    updatedAt: now,
    publishedAt: now,
    path: spec.path,
    sectionId: spec.section,
    title,
    subtitle: spec.subtitle,
    summary,
    body: isEn ? spec.enBlocks || spec.blocks || [] : spec.blocks || [],
    heroImageId: undefined,
    audiences: spec.audiences || [],
    tags: spec.tags || [],
    relatedIds: [],
    seo: {
      title: (spec.seoTitle || title).slice(0, 60),
      description: (spec.seoDescription || summary).slice(0, 160)
    },
    template: spec.template || 'default'
  }
}

const pages = []

function addPage(spec) {
  pages.push(spec)
}

const commonBlocks = (title, section) => [
  p(`Раздел «${section}» собирает ключевую информацию по теме «${title}». Здесь опубликованы официальные сведения, контакты ответственных подразделений и ссылки на документы.`),
  p('Информация обновляется по мере изменения нормативных документов и расписания. Если вы не нашли нужный документ, обратитесь в приёмную комиссию или в соответствующее подразделение.'),
  h('Что важно знать'),
  list([
    'Все официальные документы публикуются с датой и версией.',
    'Ссылки на внешние сервисы открываются в новой вкладке.',
    'Для уточнения индивидуальной ситуации используйте контакты ответственного подразделения.'
  ])
]

function bilingual(spec, enTitle, enSummary, enBlocks) {
  return { ...spec, enTitle, enSummary, enBlocks }
}

addPage(bilingual(
  {
    path: '/',
    section: 'home',
    title: 'ГМУ им. адм. Ф.Ф. Ушакова',
    summary: 'Официальный сайт Государственного морского университета имени адмирала Ф.Ф. Ушакова.',
    blocks: [p('Государственный морской университет имени адмирала Ф.Ф. Ушакова — ведущий морской вуз юга России.')],
    seoTitle: 'ГМУ им. адм. Ф.Ф. Ушакова — официальный сайт',
    seoDescription: 'Поступление, программы обучения, наука и студенческая жизнь в Государственном морском университете имени адмирала Ф.Ф. Ушакова.'
  },
  'Admiral Ushakov Maritime State University',
  'Official website of Admiral F.F. Ushakov State Maritime University.',
  [p('Admiral Ushakov State Maritime University is a leading maritime university in southern Russia.')]
))

addPage(bilingual(
  {
    path: '/about',
    section: 'about',
    title: 'Университет',
    summary: 'История, миссия, структура, руководство, сотрудники и документы университета.',
    blocks: [
      p('Государственный морской университет имени адмирала Ф.Ф. Ушакова — один из ведущих морских вузов России. Университет готовит специалистов для морского и речного транспорта, экономики, права и инженерных отраслей.'),
      p('Здесь собраны сведения о структуре, руководстве, сотрудниках, документах и проектах университета. Обязательная информация об образовательной организации раскрывается в отдельном разделе «Сведения об образовательной организации».'),
      callout('info', 'Сведения об образовательной организации', 'Официальные данные о лицензиях, аккредитации, программах и документах доступны в разделе «Сведения об образовательной организации».')
    ]
  },
  'University',
  'History, mission, structure, leadership, staff and documents.',
  [
    p('Admiral Ushakov State Maritime University is one of Russia’s leading maritime universities, training specialists for sea and inland transport, economics, law and engineering.'),
    p('This section brings together information about the structure, leadership, staff, documents and projects. Mandatory information about the educational organisation is published separately.'),
    callout('info', 'Information about the educational organisation', 'Official data on licences, accreditation, programmes and documents is available in the dedicated section.')
  ]
))

addPage(bilingual(
  {
    path: '/about/history',
    section: 'about',
    title: 'История университета',
    summary: 'От Новороссийского высшего инженерного морского училища до Государственного морского университета.',
    blocks: [
      p('История университета началась в 1975 году, когда в Новороссийске было основано высшее инженерное морское училище. За десятилетия вуз стал крупным образовательным и научным центром морской отрасли.'),
      h('Ключевые даты'),
      list([
        '1975 — основание Новороссийского высшего инженерного морского училища.',
        '1990-е — преобразование в Государственную морскую академию.',
        '2000-е — создание университета и расширение направлений подготовки.',
        '2010-е — развитие международного сотрудничества и тренажёрной базы.',
        '2020-е — цифровизация обучения и научных исследований.'
      ], true),
      p('Сегодня университет носит имя адмирала Фёдора Фёдоровича Ушакова, чьи традиции — профессионализм, ответственность и уважение к морю — определяют культуру вуза.')
    ]
  },
  'History',
  'From the Novorossiysk Higher Engineering Maritime School to a state maritime university.',
  [
    p('The university’s history began in 1975 with the founding of the Novorossiysk Higher Engineering Maritime School. Over the decades it has become a major educational and research centre for the maritime industry.'),
    h('Key dates'),
    list([
      '1975 — founding of the Novorossiysk Higher Engineering Maritime School.',
      '1990s — transformation into the State Maritime Academy.',
      '2000s — university status and expansion of degree programmes.',
      '2010s — international cooperation and simulator facilities.',
      '2020s — digitalisation of education and research.'
    ], true),
    p('Today the university bears the name of Admiral Fyodor Ushakov, whose traditions of professionalism, responsibility and respect for the sea shape the institution.')
  ]
))

addPage(bilingual(
  {
    path: '/about/mission',
    section: 'about',
    title: 'Миссия и ценности',
    summary: 'Подготовка ответственных профессионалов для морской отрасли и развитие морской науки.',
    blocks: [
      p('Миссия университета — готовить высококвалифицированных специалистов для морского и речного транспорта, обеспечивать безопасность судоходства и развивать научные исследования мирового уровня.'),
      h('Наши ценности'),
      list(['Профессионализм и ответственность.', 'Уважение к морским традициям.', 'Открытость и международное сотрудничество.', 'Безопасность и устойчивое развитие.', 'Поддержка студентов и сотрудников.']),
      p('Университет стремится создать среду, в которой знания соединяются с практикой, а выпускники готовы работать в сложных и ответственных условиях.')
    ]
  },
  'Mission and values',
  'Preparing responsible professionals for the maritime industry and advancing maritime science.',
  [
    p('The university’s mission is to prepare highly qualified specialists for sea and inland transport, ensure navigational safety and conduct world-class research.'),
    h('Our values'),
    list(['Professionalism and responsibility.', 'Respect for maritime traditions.', 'Openness and international cooperation.', 'Safety and sustainable development.', 'Support for students and staff.']),
    p('The university creates an environment where knowledge meets practice and graduates are ready for demanding professional work.')
  ]
))

addPage(bilingual(
  {
    path: '/about/strategy',
    section: 'about',
    title: 'Стратегия развития',
    summary: 'Приоритеты университета: качество образования, наука, цифровизация и международное партнёрство.',
    blocks: [
      p('Стратегия развития университета направлена на укрепление позиций в морском образовании и науке, обновление инфраструктуры и расширение международного сотрудничества.'),
      h('Приоритетные направления'),
      list(['Совершенствование образовательных программ и практической подготовки.', 'Развитие научных школ и прикладных исследований.', 'Цифровая трансформация управления и обучения.', 'Международная академическая мобильность.', 'Создание современной кампусной среды.']),
      p('Показатели реализации стратегии ежегодно рассматриваются на заседаниях учёного совета.')
    ]
  },
  'Development strategy',
  'Priorities: education quality, research, digitalisation and international partnership.',
  [
    p('The development strategy aims to strengthen the university’s position in maritime education and research, modernise infrastructure and expand international cooperation.'),
    h('Priority areas'),
    list(['Improving degree programmes and practical training.', 'Developing research schools and applied projects.', 'Digital transformation of learning and administration.', 'International academic mobility.', 'Creating a modern campus environment.']),
    p('Progress is reviewed annually by the academic council.')
  ]
))

addPage(bilingual(
  {
    path: '/about/rector',
    section: 'about',
    title: 'Ректор',
    summary: 'Кондратьев Сергей Иванович — ректор Государственного морского университета имени адмирала Ф.Ф. Ушакова.',
    blocks: [
      p('Ректор университета — Кондратьев Сергей Иванович, доктор технических наук, профессор. Он руководит стратегическим развитием вуза и представляет университет в органах государственной власти и отраслевых организациях.'),
      h('Приём по личным вопросам'),
      p('Приём посетителей проводится по предварительной записи. Запись осуществляется через приёмную ректора.'),
      callout('info', 'Контакты', 'Телефон приёмной: +7 (8617) 76-78-00. Электронная почта: mail@nsma.ru.')
    ]
  },
  'Rector',
  'Sergey Kondratyev, Rector of Admiral Ushakov State Maritime University.',
  [
    p('The Rector is Sergey Ivanovich Kondratyev, Doctor of Technical Sciences and Professor. He leads the university’s strategic development and represents it in government and industry organisations.'),
    h('Personal appointments'),
    p('Appointments are available by prior arrangement through the Rector’s Office.'),
    callout('info', 'Contacts', 'Rector’s Office phone: +7 (8617) 76-78-00. Email: mail@nsma.ru.')
  ]
))

addPage(bilingual(
  {
    path: '/about/academic-council',
    section: 'about',
    title: 'Учёный совет',
    summary: 'Коллегиальный орган управления университетом: состав, заседания и решения.',
    blocks: [
      p('Учёный совет является коллегиальным органом управления университетом. Он рассматривает вопросы образовательной, научной и административной деятельности.'),
      h('Основные задачи'),
      list(['Утверждение образовательных программ и учебных планов.', 'Рассмотрение вопросов научной работы и аттестации.', 'Принятие решений о развитии инфраструктуры.', 'Поддержка студенческих инициатив.']),
      p('Заседания проводятся в соответствии с планом работы учёного совета. Протоколы и решения публикуются в разделе «Документы».')
    ]
  },
  'Academic council',
  'The collegial governing body: membership, meetings and decisions.',
  [
    p('The Academic Council is the collegial governing body of the university, addressing education, research and administrative matters.'),
    h('Main tasks'),
    list(['Approval of degree programmes and curricula.', 'Research and academic promotion matters.', 'Infrastructure development decisions.', 'Support for student initiatives.']),
    p('Meetings follow the council’s annual plan. Minutes and decisions are published in the Documents section.')
  ]
))

addPage(bilingual(
  {
    path: '/about/employees',
    section: 'about',
    title: 'Сотрудники и преподаватели',
    summary: 'Каталог сотрудников университета с контактами и профессиональными сведениями.',
    blocks: [p('В каталоге представлены руководители, преподаватели и сотрудники университета. Используйте поиск и фильтр по подразделению, чтобы найти нужного человека.')],
    template: 'default'
  },
  'Staff and faculty',
  'University staff directory with contacts and professional information.',
  [p('The directory lists university leaders, faculty and staff. Use search and unit filters to find the person you need.')]
))

addPage(bilingual(
  {
    path: '/about/documents',
    section: 'about',
    title: 'Документы университета',
    summary: 'Устав, лицензии, локальные акты, правила приёма и другие официальные документы.',
    blocks: [p('В разделе опубликованы официальные документы университета. Документы сгруппированы по категориям; для поиска используйте фильтры.')],
    template: 'documents'
  },
  'University documents',
  'Charter, licences, local acts, admission rules and other official documents.',
  [p('This section contains official university documents grouped by category. Use the filters to find what you need.')]
))

addPage(bilingual(
  {
    path: '/about/museum',
    section: 'about',
    title: 'Музей университета',
    summary: 'История университета, экспонаты, фотографии и архивные материалы.',
    blocks: [
      p('Музей университета хранит историю вуза: документы, фотографии, награды и предметы, связанные с морскими традициями.'),
      p('Экспозиция рассказывает об основании училища, развитии университета и достижениях выпускников.')
    ]
  },
  'University museum',
  'University history, exhibits, photographs and archival materials.',
  [p('The museum preserves the university’s history through documents, photographs, awards and objects related to maritime traditions.'), p('The exhibition covers the founding of the school, the development of the university and the achievements of its graduates.')]
))

addPage(bilingual(
  {
    path: '/about/projects',
    section: 'about',
    title: 'Проекты университета',
    summary: 'Навигацкая школа, Большой университет и другие стратегические проекты.',
    blocks: [
      p('Университет реализует проекты, направленные на развитие морского образования, науки и городской среды.'),
      h('Навигацкая школа'),
      p('Проект создаёт условия для ранней профориентации школьников и подготовки к поступлению на морские специальности.'),
      h('Большой университет'),
      p('Инициатива объединяет образовательные, научные и инфраструктурные проекты университета и партнёров.')
    ]
  },
  'University projects',
  'Navigation School, Big University and other strategic projects.',
  [p('The university runs projects that develop maritime education, research and the urban environment.'), h('Navigation School'), p('The project supports early career guidance for school students and preparation for maritime study.'), h('Big University'), p('The initiative brings together educational, research and infrastructure projects with partners.')]
))

addPage(bilingual(
  {
    path: '/about/anti-corruption',
    section: 'about',
    title: 'Противодействие коррупции',
    summary: 'Нормативные документы, порядок обращения и контакты ответственного подразделения.',
    blocks: [
      p('Университет проводит политику противодействия коррупции в соответствии с законодательством Российской Федерации.'),
      h('Что делать при обнаружении признаков коррупции'),
      list(['Сообщить в административно-правовое управление.', 'Направить обращение на официальную электронную почту.', 'Использовать телефон доверия.']),
      p('Конфиденциальность обращения обеспечивается в пределах, установленных законом.')
    ]
  },
  'Anti-corruption',
  'Regulatory documents, reporting procedure and contacts.',
  [p('The university implements an anti-corruption policy in accordance with Russian law.'), h('What to do if you suspect corruption'), list(['Contact the administrative and legal department.', 'Send a message to the official email address.', 'Use the trust phone line.']), p('Confidentiality is ensured within the limits established by law.')]
))

addPage(bilingual(
  {
    path: '/about/quality',
    section: 'about',
    title: 'Политика в области качества',
    summary: 'Принципы обеспечения качества образования и постоянного улучшения процессов.',
    blocks: [
      p('Политика в области качества определяет обязательства университета по обеспечению высокого уровня образовательных услуг и постоянному улучшению процессов.'),
      list(['Ориентация на потребности обучающихся и работодателей.', 'Системный мониторинг качества образования.', 'Развитие компетенций преподавателей.', 'Открытость результатов деятельности.'])
    ]
  },
  'Quality policy',
  'Principles for ensuring education quality and continuous improvement.',
  [p('The quality policy sets out the university’s commitment to high-quality education and continuous improvement.'), list(['Focus on students and employers.', 'Systematic monitoring of education quality.', 'Faculty development.', 'Transparency of results.'])]
))

addPage(bilingual(
  {
    path: '/about/structure',
    section: 'about',
    title: 'Структура университета',
    summary: 'Факультеты, институты, колледжи, управления и отделы университета.',
    blocks: [p('Структура университета включает факультеты, институты, колледжи, управления и отделы. Выберите подразделение, чтобы увидеть контакты, руководителя и направления работы.')]
  },
  'University structure',
  'Faculties, institutes, colleges, departments and offices.',
  [p('The university includes faculties, institutes, colleges, departments and offices. Select a unit to see contacts, leadership and areas of work.')]
))

for (const [type, title, enTitle, slugPath] of [
  ['faculties', 'Факультеты', 'Faculties', '/about/structure/faculties'],
  ['institutes', 'Институты', 'Institutes', '/about/structure/institutes'],
  ['colleges', 'Колледжи', 'Colleges', '/about/structure/colleges'],
  ['departments', 'Кафедры', 'Departments', '/about/structure/departments'],
  ['administrations', 'Управления и отделы', 'Administrations and offices', '/about/structure/administrations'],
  ['branches', 'Филиалы', 'Branches', '/about/structure/branches']
]) {
  addPage(bilingual(
    {
      path: slugPath,
      section: 'about',
      title,
      summary: `${title} Государственного морского университета имени адмирала Ф.Ф. Ушакова.`,
      blocks: [p(`В разделе представлены ${title.toLowerCase()} университета. Откройте карточку подразделения, чтобы увидеть контакты, руководителя и документы.`)]
    },
    enTitle,
    `${enTitle} of Admiral Ushakov State Maritime University.`,
    [p(`This section lists the university’s ${enTitle.toLowerCase()}. Open a unit card for contacts, leadership and documents.`)]
  ))
}

addPage(bilingual(
  {
    path: '/about/structure/military-center',
    section: 'about',
    title: 'Военный учебный центр',
    summary: 'Военная подготовка студентов, правила приёма и контакты.',
    blocks: [
      p('Военный учебный центр университета осуществляет военную подготовку студентов по программам, установленным Министерством обороны Российской Федерации.'),
      h('Как поступить'),
      list(['Ознакомиться с правилами отбора.', 'Пройти медицинское освидетельствование.', 'Подать документы в установленные сроки.']),
      p('Контактные данные и график работы опубликованы в карточке подразделения.')
    ]
  },
  'Military Training Centre',
  'Military training for students, admission rules and contacts.',
  [p('The Military Training Centre provides military training under programmes established by the Ministry of Defence.'), h('How to join'), list(['Read the selection rules.', 'Complete a medical examination.', 'Submit documents within the deadlines.']), p('Contact details and office hours are published in the unit card.')]
))

addPage(bilingual(
  {
    path: '/admissions',
    section: 'admissions',
    title: 'Поступление',
    summary: 'Всё о приёме в 2026 году: уровни подготовки, правила, сроки, экзамены, стоимость и подача документов.',
    blocks: [
      p('Приёмная кампания 2026 года открыта. Выберите уровень подготовки, изучите правила и сроки, подготовьте документы и подайте заявление удобным способом.'),
      callout('info', 'Подача документов', 'Основной способ подачи — личный кабинет абитуриента. Инструкция и ссылка на сервис доступны на странице «Подать документы».'),
      h('С чего начать'),
      list(['Выберите уровень подготовки и направление.', 'Проверьте перечень вступительных испытаний.', 'Уточните сроки и форму обучения.', 'Подготовьте документы и подайте заявление.']),
      p('Приёмная комиссия отвечает на вопросы по телефону +7 (8617) 71-75-25 и по электронной почте pcom@nsma.ru.')
    ]
  },
  'Admissions',
  'Everything about applying in 2026: study levels, rules, deadlines, exams, tuition and application.',
  [
    p('The 2026 admissions campaign is open. Choose your study level, read the rules and deadlines, prepare your documents and apply in a convenient way.'),
    callout('info', 'How to apply', 'The main route is the applicant portal. Instructions and the service link are available on the Apply page.'),
    h('Where to start'),
    list(['Choose a study level and programme.', 'Check the entrance examinations.', 'Check deadlines and study forms.', 'Prepare documents and apply.']),
    p('The admissions office answers questions by phone +7 (8617) 71-75-25 and email pcom@nsma.ru.')
  ]
))

const admissionLevels = [
  ['bachelor', 'Бакалавриат', "Bachelor's degree", 'Поступление на программы бакалавриата: сроки, экзамены, места и документы.', 'Applying for bachelor programmes: deadlines, exams, places and documents.'],
  ['specialist', 'Специалитет', "Specialist's degree", 'Поступление на программы специалитета: сроки, экзамены, места и документы.', 'Applying for specialist programmes: deadlines, exams, places and documents.'],
  ['master', 'Магистратура', "Master's degree", 'Поступление в магистратуру: требования, экзамены, сроки и документы.', 'Applying for master programmes: requirements, exams, deadlines and documents.'],
  ['graduate', 'Аспирантура', 'Postgraduate study', 'Поступление в аспирантуру: направления, экзамены, сроки и научные руководители.', 'Postgraduate admission: fields, exams, deadlines and supervisors.'],
  ['college', 'СПО и колледжи', 'Vocational education', 'Поступление в колледжи университета: специальности, сроки и документы.', 'Applying to university colleges: programmes, deadlines and documents.'],
  ['dpo', 'ДПО', 'Continuing education', 'Дополнительное профессиональное образование и повышение квалификации.', 'Continuing professional education and advanced training.'],
  ['international', 'Иностранным абитуриентам', 'International applicants', 'Поступление иностранных граждан: документы, виза, проживание и адаптация.', 'Admission of international citizens: documents, visa, accommodation and adaptation.']
]

for (const [slug, title, enTitle, summary, enSummary] of admissionLevels) {
  addPage(bilingual(
    {
      path: `/admissions/${slug}`,
      section: 'admissions',
      title,
      summary,
      blocks: [
        p(`${title}: актуальные сроки, перечень вступительных испытаний и количество мест публикуются приёмной комиссией.`),
        h('Что нужно знать'),
        list(['Перечень экзаменов зависит от выбранного направления.', 'Индивидуальные достижения учитываются по правилам приёма.', 'Документы можно подать через личный кабинет абитуриента.', 'Стоимость обучения публикуется отдельно по каждой программе.']),
        callout('info', 'Приёмная комиссия', 'Телефон: +7 (8617) 71-75-25. Email: pcom@nsma.ru.')
      ]
    },
    enTitle,
    enSummary,
    [
      p(`${enTitle}: current deadlines, entrance examinations and places are published by the admissions office.`),
      h('Key information'),
      list(['Examinations depend on the chosen programme.', 'Individual achievements are considered under the admission rules.', 'Documents can be submitted through the applicant portal.', 'Tuition is published separately for each programme.']),
      callout('info', 'Admissions office', 'Phone: +7 (8617) 71-75-25. Email: pcom@nsma.ru.')
    ]
  ))
}

addPage(bilingual(
  {
    path: '/admissions/rules',
    section: 'admissions',
    title: 'Правила приёма',
    summary: 'Правила приёма на программы высшего и среднего профессионального образования.',
    blocks: [
      p('Правила приёма определяют порядок подачи документов, перечень вступительных испытаний, условия участия в конкурсе и зачисления.'),
      h('Основные документы'),
      list(['Правила приёма на программы высшего образования.', 'Правила приёма на программы среднего профессионального образования.', 'Правила приёма в аспирантуру.', 'Перечень индивидуальных достижений.']),
      callout('warning', 'Актуальность', 'Всегда проверяйте версию документа и дату публикации. Старые редакции не применяются к текущей кампании.')
    ]
  },
  'Admission rules',
  'Admission rules for higher and vocational education programmes.',
  [
    p('The admission rules define the application procedure, entrance examinations, competition conditions and enrolment.'),
    h('Main documents'),
    list(['Rules for higher education programmes.', 'Rules for vocational education programmes.', 'Postgraduate admission rules.', 'List of individual achievements.']),
    callout('warning', 'Current version', 'Always check the document version and publication date. Old editions do not apply to the current campaign.')
  ]
))

addPage(bilingual(
  {
    path: '/admissions/dates',
    section: 'admissions',
    title: 'Сроки и этапы',
    summary: 'Календарь приёмной кампании 2026 года: начало и окончание приёма, экзамены и зачисление.',
    blocks: [
      p('Приёмная кампания 2026 года начинается 20 июня. Даты окончания приёма документов зависят от уровня подготовки и формы обучения.'),
      table(['Этап', 'Срок'], [
        ['Начало приёма документов', '20 июня 2026 г.'],
        ['Окончание приёма (бюджет, очная форма)', '25 июля 2026 г.'],
        ['Вступительные испытания', 'июль — август 2026 г.'],
        ['Публикация конкурсных списков', 'по графику приёмной комиссии'],
        ['Зачисление', 'август 2026 г.']
      ], 'Календарь приёмной кампании 2026 года'),
      p('Точные даты для каждого уровня публикуются в правилах приёма и на страницах соответствующих уровней подготовки.')
    ]
  },
  'Dates and stages',
  '2026 admissions calendar: application dates, exams and enrolment.',
  [
    p('The 2026 admissions campaign starts on 20 June. Closing dates depend on the study level and form.'),
    table(['Stage', 'Date'], [
      ['Applications open', '20 June 2026'],
      ['Applications close (budget, full-time)', '25 July 2026'],
      ['Entrance examinations', 'July — August 2026'],
      ['Competition lists', 'per admissions office schedule'],
      ['Enrolment', 'August 2026']
    ], '2026 admissions calendar'),
    p('Exact dates for each level are published in the admission rules and on the relevant level pages.')
  ]
))

addPage(bilingual(
  {
    path: '/admissions/exams',
    section: 'admissions',
    title: 'Вступительные испытания',
    summary: 'Перечень экзаменов, минимальные баллы и программы вступительных испытаний.',
    blocks: [
      p('Перечень вступительных испытаний определяется выбранным направлением подготовки. Для школьников это, как правило, результаты ЕГЭ; для выпускников СПО и вузов возможны внутренние экзамены.'),
      h('Где найти информацию'),
      list(['На карточке программы в каталоге.', 'В правилах приёма.', 'В разделе «Документы».']),
      callout('info', 'Минимальные баллы', 'Минимальные баллы ежегодно устанавливаются приёмной комиссией и публикуются до начала приёма документов.')
    ]
  },
  'Entrance examinations',
  'Examination list, minimum scores and examination programmes.',
  [
    p('The entrance examinations depend on the chosen programme. School leavers usually submit Unified State Exam results; vocational and university graduates may take internal exams.'),
    h('Where to find information'),
    list(['On each programme card in the catalogue.', 'In the admission rules.', 'In the Documents section.']),
    callout('info', 'Minimum scores', 'Minimum scores are set annually by the admissions office and published before applications open.')
  ]
))

addPage(bilingual(
  {
    path: '/admissions/tuition',
    section: 'admissions',
    title: 'Стоимость обучения',
    summary: 'Стоимость обучения по уровням, направлениям и формам подготовки.',
    blocks: [
      p('Стоимость обучения зависит от уровня подготовки, направления и формы обучения. Актуальные документы публикуются приёмной комиссией.'),
      table(['Уровень', 'Очная форма', 'Заочная форма'], [
        ['Бакалавриат / специалитет', 'от 142 000 ₽ в год', 'от 58 000 ₽ в год'],
        ['Магистратура', 'от 155 000 ₽ в год', 'от 65 000 ₽ в год'],
        ['СПО', 'от 98 000 ₽ в год', '—'],
        ['Аспирантура', 'от 155 000 ₽ в год', '—']
      ], 'Ориентировочная стоимость обучения, 2026/2027 учебный год'),
      callout('warning', 'Важно', 'Таблица носит ознакомительный характер. Точная стоимость указана в официальных документах и на карточках программ.')
    ]
  },
  'Tuition',
  'Tuition by level, programme and study form.',
  [
    p('Tuition depends on the study level, programme and form. Current documents are published by the admissions office.'),
    table(['Level', 'Full-time', 'Part-time'], [
      ['Bachelor / specialist', 'from RUB 142,000 per year', 'from RUB 58,000 per year'],
      ['Master', 'from RUB 155,000 per year', 'from RUB 65,000 per year'],
      ['Vocational', 'from RUB 98,000 per year', '—'],
      ['Postgraduate', 'from RUB 155,000 per year', '—']
    ], 'Indicative tuition, 2026/2027 academic year'),
    callout('warning', 'Important', 'The table is indicative. Exact tuition is stated in official documents and on programme cards.')
  ]
))

addPage(bilingual(
  {
    path: '/admissions/dormitory',
    section: 'admissions',
    title: 'Общежитие',
    summary: 'Правила заселения, стоимость проживания и документы для иногородних студентов.',
    blocks: [
      p('Университет предоставляет общежитие иногородним и иностранным студентам. Места распределяются с учётом категорий обучающихся и доступного фонда.'),
      h('Как заселиться'),
      list(['Подать заявление в деканат или управление воспитательной работы.', 'Подготовить документы: паспорт, справку о зачислении, медицинские документы.', 'Ознакомиться с правилами проживания и техникой безопасности.']),
      p('Стоимость проживания и контакты ответственного подразделения уточняются в разделе «Студенческая жизнь → Общежитие».')
    ]
  },
  'Dormitory',
  'Check-in rules, accommodation fees and documents for non-local students.',
  [
    p('The university provides dormitory accommodation for non-local and international students. Places are allocated according to student categories and available capacity.'),
    h('How to check in'),
    list(['Submit an application to the faculty or student affairs office.', 'Prepare your passport, enrolment certificate and medical documents.', 'Read the accommodation and safety rules.']),
    p('Accommodation fees and contacts are available in Student Life → Dormitory.')
  ]
))

addPage(bilingual(
  {
    path: '/admissions/target',
    section: 'admissions',
    title: 'Целевое обучение',
    summary: 'Поступление по договору о целевом обучении с будущим работодателем.',
    blocks: [
      p('Целевое обучение позволяет поступить по договору с организацией-заказчиком и получить гарантированное место работы после выпуска.'),
      h('Порядок действий'),
      list(['Найти заказчика и заключить договор о целевом обучении.', 'Подать документы в университет в установленные сроки.', 'Участвовать в конкурсе в рамках целевой квоты.']),
      p('Перечень заказчиков и количество мест публикуются приёмной комиссией.')
    ]
  },
  'Targeted training',
  'Admission under a contract with a future employer.',
  [
    p('Targeted training allows applicants to study under a contract with an employer and secure a job after graduation.'),
    h('Steps'),
    list(['Find an employer and sign a targeted training contract.', 'Apply to the university within the deadlines.', 'Compete for a targeted quota place.']),
    p('The list of employers and available places is published by the admissions office.')
  ]
))

addPage(bilingual(
  {
    path: '/admissions/faq',
    section: 'admissions',
    title: 'Частые вопросы',
    summary: 'Ответы на вопросы о подаче документов, сроках, экзаменах и зачислении.',
    blocks: [p('Собрали ответы на самые частые вопросы абитуриентов и родителей. Если ответа нет, обратитесь в приёмную комиссию.')]
  },
  'Frequently asked questions',
  'Answers about applications, deadlines, exams and enrolment.',
  [p('Answers to the most common questions from applicants and parents. If your question is not covered, contact the admissions office.')]
))

addPage(bilingual(
  {
    path: '/admissions/apply',
    section: 'admissions',
    title: 'Подать документы',
    summary: 'Инструкция и ссылка на личный кабинет абитуриента.',
    blocks: [
      p('Заявление подаётся через личный кабинет абитуриента. Сервис открывается во внешней вкладке.'),
      h('Перед подачей подготовьте'),
      list(['Паспорт.', 'Документ об образовании.', 'СНИЛС (при наличии).', 'Документы, подтверждающие индивидуальные достижения.', 'Фотографию (при необходимости).']),
      callout('info', 'Демо-режим', 'Ссылка ведёт на внешний сервис университета. В демонстрационной версии сайта реальная подача документов не выполняется.'),
      p('Если возникли технические проблемы, обратитесь в приёмную комиссию по телефону +7 (8617) 71-75-25.')
    ]
  },
  'Apply',
  'Instructions and a link to the applicant portal.',
  [
    p('Applications are submitted through the applicant portal, which opens in a new tab.'),
    h('Before applying, prepare'),
    list(['Passport.', 'Education certificate.', 'Insurance number (if available).', 'Documents confirming individual achievements.', 'Photograph (if required).']),
    callout('info', 'Demo mode', 'The link opens an external university service. In this demo site no real application is submitted.'),
    p('If you have technical problems, contact the admissions office on +7 (8617) 71-75-25.')
  ]
))

addPage(bilingual(
  {
    path: '/education',
    section: 'education',
    title: 'Образование',
    summary: 'Каталог программ, уровни подготовки, учебный процесс, библиотека и дополнительное образование.',
    blocks: [
      p('Университет реализует программы среднего профессионального, высшего и дополнительного образования. В каталоге можно выбрать направление по уровню, форме обучения и факультету.'),
      h('Уровни подготовки'),
      list(['Среднее профессиональное образование.', 'Бакалавриат.', 'Специалитет.', 'Магистратура.', 'Аспирантура.', 'Дополнительное профессиональное образование.']),
      p('Для студентов доступны расписание занятий, электронная библиотека, методические материалы и сервисы личного кабинета.')
    ]
  },
  'Education',
  'Programme catalogue, study levels, academic process, library and continuing education.',
  [
    p('The university offers vocational, higher and continuing education programmes. The catalogue can be filtered by level, study form and faculty.'),
    h('Study levels'),
    list(['Vocational education.', "Bachelor's degree.", "Specialist's degree.", "Master's degree.", 'Postgraduate study.', 'Continuing professional education.']),
    p('Students have access to the timetable, digital library, learning materials and the student portal.')
  ]
))

addPage(bilingual(
  {
    path: '/education/programs',
    section: 'education',
    title: 'Каталог программ',
    summary: 'Все направления подготовки университета с фильтрами по уровню, форме обучения и факультету.',
    blocks: [p('Выберите программу, чтобы узнать код, форму и срок обучения, количество мест, стоимость и вступительные испытания.')],
    template: 'catalog'
  },
  'Programme catalogue',
  'All university programmes with filters by level, study form and faculty.',
  [p('Select a programme to see its code, study form and duration, places, tuition and entrance examinations.')]
))

for (const [slug, title, enTitle, summary, enSummary] of [
  ['bachelor', 'Бакалавриат', "Bachelor's programmes", 'Обзор программ бакалавриата и переход в каталог.', 'Overview of bachelor programmes and the catalogue.'],
  ['specialist', 'Специалитет', "Specialist's programmes", 'Обзор программ специалитета и переход в каталог.', 'Overview of specialist programmes and the catalogue.'],
  ['master', 'Магистратура', "Master's programmes", 'Обзор программ магистратуры и переход в каталог.', 'Overview of master programmes and the catalogue.'],
  ['graduate', 'Аспирантура и докторантура', 'Postgraduate and doctoral study', 'Программы подготовки кадров высшей квалификации.', 'Postgraduate and doctoral programmes.'],
  ['college', 'Колледжи', 'Colleges', 'Программы среднего профессионального образования.', 'Vocational education programmes.'],
  ['dpo', 'ДПО и повышение квалификации', 'Continuing education', 'Дополнительные профессиональные программы.', 'Continuing professional programmes.']
]) {
  addPage(bilingual(
    {
      path: `/education/${slug}`,
      section: 'education',
      title,
      summary,
      blocks: [
        p(`${title}: программы, условия обучения и документы. Полный перечень направлений доступен в каталоге программ.`),
        list(['Актуальные программы и формы обучения.', 'Сроки и стоимость.', 'Документы и учебные планы.']),
        p('Перейдите в каталог, чтобы отфильтровать программы по уровню и факультету.')
      ]
    },
    enTitle,
    enSummary,
    [
      p(`${enTitle}: programmes, study conditions and documents. The full list is available in the programme catalogue.`),
      list(['Current programmes and study forms.', 'Duration and tuition.', 'Documents and curricula.']),
      p('Open the catalogue to filter programmes by level and faculty.')
    ]
  ))
}

addPage(bilingual(
  {
    path: '/education/schedule',
    section: 'education',
    title: 'Расписание занятий',
    summary: 'Актуальное расписание занятий для студентов и преподавателей.',
    blocks: [
      p('Расписание занятий публикуется в отдельном сервисе университета. Для просмотра используется внешняя система, доступная по ссылке.'),
      callout('info', 'Внешний сервис', 'Если встроенное расписание не отображается, воспользуйтесь прямой ссылкой на сервис университета.')
    ]
  },
  'Timetable',
  'Current timetable for students and teachers.',
  [
    p('The timetable is published in a separate university service. It is available via an external link.'),
    callout('info', 'External service', 'If the embedded timetable does not load, use the direct link to the university service.')
  ]
))

addPage(bilingual(
  {
    path: '/education/library',
    section: 'education',
    title: 'Библиотека',
    summary: 'Электронные ресурсы, каталоги, периодические издания и правила пользования.',
    blocks: [
      p('Библиотека университета обеспечивает доступ к учебной, научной и периодической литературе. Студенты и сотрудники могут пользоваться электронными ресурсами и читальными залами.'),
      h('Разделы библиотеки'),
      list(['Электронные ресурсы.', 'Каталоги и картотеки.', 'Периодические издания.', 'Новые поступления.', 'Правила пользования.', 'История и структура библиотеки.', 'Часы работы.']),
      p('Для доступа к электронным ресурсам может потребоваться авторизация в образовательном портале.')
    ]
  },
  'Library',
  'Digital resources, catalogues, periodicals and user rules.',
  [
    p('The university library provides access to academic, research and periodical literature. Students and staff can use digital resources and reading rooms.'),
    h('Library sections'),
    list(['Digital resources.', 'Catalogues and card indexes.', 'Periodicals.', 'New arrivals.', 'User rules.', 'History and structure.', 'Opening hours.']),
    p('Access to digital resources may require authorisation in the learning portal.')
  ]
))

for (const [slug, title, enTitle, summary, enSummary] of [
  ['electronic', 'Электронные ресурсы', 'Digital resources', 'Доступ к электронным библиотечным системам и базам данных.', 'Access to digital library systems and databases.'],
  ['catalogs', 'Каталоги и картотеки', 'Catalogues and indexes', 'Поиск по фондам библиотеки.', 'Search the library collections.'],
  ['periodicals', 'Периодические издания', 'Periodicals', 'Газеты, журналы и научная периодика.', 'Newspapers, magazines and academic periodicals.'],
  ['new-arrivals', 'Новые поступления', 'New arrivals', 'Новые книги и материалы в фонде библиотеки.', 'New books and materials in the library collection.'],
  ['rules', 'Правила пользования', 'User rules', 'Порядок записи, выдачи и возврата изданий.', 'Registration, borrowing and return rules.'],
  ['history', 'История библиотеки', 'Library history', 'История формирования библиотечного фонда.', 'The history of the library collection.'],
  ['structure', 'Структура библиотеки', 'Library structure', 'Отделы и залы библиотеки.', 'Library departments and reading rooms.'],
  ['hours', 'Часы работы', 'Opening hours', 'Режим работы библиотеки и читальных залов.', 'Library and reading room opening hours.']
]) {
  addPage(bilingual(
    {
      path: `/education/library/${slug}`,
      section: 'education',
      title,
      summary,
      blocks: [p(`${title}: информация библиотеки университета.`), p('Актуальные сведения уточняйте у сотрудников библиотеки или на информационной стойке.')]
    },
    enTitle,
    enSummary,
    [p(`${enTitle}: university library information.`), p('For current details, contact the library staff or the information desk.')]
  ))
}

addPage(bilingual(
  {
    path: '/education/legal-clinic',
    section: 'education',
    title: 'Юридическая клиника',
    summary: 'Бесплатная юридическая помощь и практика студентов-юристов.',
    blocks: [
      p('Юридическая клиника университета оказывает бесплатную консультационную помощь гражданам и предоставляет студентам возможность пройти практику под руководством преподавателей.'),
      h('Направления помощи'),
      list(['Гражданское право.', 'Трудовое право.', 'Семейное право.', 'Защита прав потребителей.']),
      p('Запись на консультацию осуществляется по контактам, указанным в разделе «Контакты».')
    ]
  },
  'Legal clinic',
  'Free legal aid and practical training for law students.',
  [
    p('The university legal clinic provides free legal consultations and gives law students practical experience under faculty supervision.'),
    h('Areas of assistance'),
    list(['Civil law.', 'Labour law.', 'Family law.', 'Consumer protection.']),
    p('Appointments are made using the contacts listed in the Contacts section.')
  ]
))

addPage(bilingual(
  {
    path: '/education/mobility',
    section: 'education',
    title: 'Академическая мобильность',
    summary: 'Входящая и исходящая мобильность, обмен студентами и преподавателями.',
    blocks: [
      p('Университет развивает академическую мобильность: студенты и преподаватели участвуют в программах обмена, стажировках и совместных проектах.'),
      p('Информация о доступных программах публикуется в разделе «Международное сотрудничество».')
    ]
  },
  'Academic mobility',
  'Incoming and outgoing mobility, student and staff exchange.',
  [
    p('The university develops academic mobility through exchange programmes, internships and joint projects for students and staff.'),
    p('Information about available programmes is published in the International section.')
  ]
))

addPage(bilingual(
  {
    path: '/education/methodical',
    section: 'education',
    title: 'Методические материалы',
    summary: 'Учебно-методическое обеспечение образовательного процесса.',
    blocks: [
      p('В разделе публикуются методические материалы для преподавателей и студентов: учебные планы, рабочие программы и рекомендации.'),
      p('Документы доступны в разделе «Документы» и в личном кабинете.')
    ]
  },
  'Learning materials',
  'Academic and methodological support for the educational process.',
  [p('The section contains methodological materials for teachers and students: curricula, programme descriptions and guidelines.'), p('Documents are available in the Documents section and the student portal.')]
))

addPage(bilingual(
  {
    path: '/education/distance',
    section: 'education',
    title: 'Заочное и дистанционное обучение',
    summary: 'Программы заочной формы и электронное обучение.',
    blocks: [
      p('Университет реализует программы заочной формы обучения с применением электронных образовательных технологий.'),
      p('Расписание, учебные материалы и консультации доступны в образовательном портале.')
    ]
  },
  'Part-time and distance learning',
  'Part-time programmes and e-learning.',
  [p('The university offers part-time programmes using electronic learning technologies.'), p('Timetables, materials and consultations are available in the learning portal.')]
))

addPage(bilingual(
  {
    path: '/science',
    section: 'science',
    title: 'Наука',
    summary: 'Научные направления, лаборатории, конференции, гранты и журналы университета.',
    blocks: [
      p('Научная деятельность университета охватывает морской транспорт, судостроение, экологическую безопасность, экономику и право.'),
      h('Ключевые направления'),
      list(['Цифровая навигация и интеллектуальные транспортные системы.', 'Экологическая безопасность и устойчивое развитие.', 'Судовые энергетические установки.', 'Экономика и управление на транспорте.', 'Морское право.']),
      p('В разделе собраны лаборатории, конференции, грантовые программы и научные журналы.')
    ]
  },
  'Research',
  'Research areas, laboratories, conferences, grants and university journals.',
  [
    p('Research at the university covers maritime transport, shipbuilding, environmental safety, economics and law.'),
    h('Key areas'),
    list(['Digital navigation and intelligent transport systems.', 'Environmental safety and sustainable development.', 'Marine power plants.', 'Transport economics and management.', 'Maritime law.']),
    p('The section covers laboratories, conferences, grant programmes and academic journals.')
  ]
))

for (const [slug, title, enTitle, summary, enSummary] of [
  ['areas', 'Научные направления и школы', 'Research areas and schools', 'Научные направления, школы и исследовательские коллективы.', 'Research areas, schools and teams.'],
  ['labs', 'Лаборатории', 'Laboratories', 'Лаборатории и научное оборудование университета.', 'University laboratories and research equipment.'],
  ['institutes', 'Научно-исследовательский институт', 'Research institute', 'Научно-исследовательский институт университета.', 'The university research institute.'],
  ['technopark', 'Технопарк', 'Technopark', 'Технологическое предпринимательство и проекты.', 'Technology entrepreneurship and projects.'],
  ['graduate', 'Аспирантура', 'Postgraduate study', 'Программы подготовки кадров высшей квалификации.', 'Postgraduate programmes.'],
  ['dissertation-council', 'Диссертационный совет', 'Dissertation council', 'Состав, документы и защиты диссертаций.', 'Membership, documents and thesis defences.'],
  ['conferences', 'Конференции, конкурсы, гранты', 'Conferences, competitions, grants', 'Научные события и возможности финансирования.', 'Research events and funding opportunities.'],
  ['grants', 'Гранты', 'Grants', 'Грантовые программы и конкурсы.', 'Grant programmes and competitions.'],
  ['patents', 'Патентное обеспечение', 'Patents', 'Результаты интеллектуальной деятельности.', 'Intellectual property results.'],
  ['publications', 'Авторам публикаций', 'For authors', 'Требования к публикациям и рецензированию.', 'Publication and review requirements.']
]) {
  addPage(bilingual(
    {
      path: `/science/${slug}`,
      section: 'science',
      title,
      summary,
      blocks: [p(`${title}: информация о научной деятельности университета.`), p('Актуальные сведения и документы публикуются ответственным подразделением.')]
    },
    enTitle,
    enSummary,
    [p(`${enTitle}: information about research at the university.`), p('Current information and documents are published by the responsible unit.')]
  ))
}

addPage(bilingual(
  {
    path: '/science/journals',
    section: 'science',
    title: 'Издания университета',
    summary: 'Научные журналы университета, выпуски и правила публикации.',
    blocks: [p('Университет выпускает научные журналы по морской тематике. Для каждого журнала доступны выпуски, правила направления и рецензирования, состав редколлегии и этика публикаций.')]
  },
  'University journals',
  'University academic journals, issues and publication rules.',
  [p('The university publishes academic journals in maritime fields. Each journal page contains issues, submission and review rules, editorial board and publication ethics.')]
))

addPage(bilingual(
  {
    path: '/student-life',
    section: 'student-life',
    title: 'Студенческая жизнь',
    summary: 'События, культура, спорт, поддержка, общежитие и карьера.',
    blocks: [
      p('Студенческая жизнь в университете — это события, творчество, спорт, волонтёрство и возможности для профессионального развития.'),
      h('Что доступно студентам'),
      list(['Студенческие организации и клубы.', 'Спортивные секции и соревнования.', 'Культурные мероприятия и творческие коллективы.', 'Стипендии и меры поддержки.', 'Практика и карьерные мероприятия.', 'Доступная среда и поддержка студентов с ОВЗ.']),
      p('Следите за событиями в разделе «Новости» и в студенческих сообществах.')
    ]
  },
  'Student life',
  'Events, culture, sport, support, accommodation and careers.',
  [
    p('Student life at the university includes events, creativity, sport, volunteering and professional development.'),
    h('What is available'),
    list(['Student organisations and clubs.', 'Sports sections and competitions.', 'Cultural events and creative groups.', 'Scholarships and support measures.', 'Internships and career events.', 'Accessible environment and support for students with disabilities.']),
    p('Follow events in the News section and student communities.')
  ]
))

for (const [slug, title, enTitle, summary, enSummary] of [
  ['events', 'События', 'Events', 'Календарь событий университета.', 'University events calendar.'],
  ['culture', 'Культура', 'Culture', 'Творческие коллективы, концерты и культурные проекты.', 'Creative groups, concerts and cultural projects.'],
  ['sport', 'Спорт', 'Sport', 'Спортивные секции, соревнования и достижения.', 'Sports sections, competitions and achievements.'],
  ['organizations', 'Молодёжные организации', 'Student organisations', 'Студенческие объединения и клубы.', 'Student associations and clubs.'],
  ['dormitory', 'Общежитие', 'Dormitory', 'Правила проживания, стоимость и контакты.', 'Accommodation rules, fees and contacts.'],
  ['scholarships', 'Стипендии и меры поддержки', 'Scholarships and support', 'Виды стипендий и социальной поддержки.', 'Scholarship types and social support.'],
  ['support', 'Социальная поддержка', 'Social support', 'Помощь студентам и сотрудникам.', 'Support for students and staff.'],
  ['accessibility', 'Доступная среда и ОВЗ', 'Accessibility', 'Доступная среда и поддержка студентов с ОВЗ.', 'Accessible environment and support for students with disabilities.'],
  ['career', 'Практика и трудоустройство', 'Careers and internships', 'Практика, стажировки и вакансии.', 'Internships, placements and vacancies.'],
  ['museum', 'Музей', 'Museum', 'Экспозиция и архивные материалы.', 'Exhibits and archival materials.'],
  ['video', 'Видео', 'Video', 'Видеоматериалы университета.', 'University video materials.'],
  ['photo', 'Фотогалерея', 'Photo gallery', 'Фотографии событий и жизни университета.', 'Photos of university events and life.']
]) {
  addPage(bilingual(
    {
      path: `/student-life/${slug}`,
      section: 'student-life',
      title,
      summary,
      blocks: [p(`${title}: раздел студенческой жизни университета.`), p('Актуальные анонсы, документы и контакты публикуются ответственным подразделением.')]
    },
    enTitle,
    enSummary,
    [p(`${enTitle}: student life section.`), p('Current announcements, documents and contacts are published by the responsible unit.')]
  ))
}

addPage(bilingual(
  {
    path: '/international',
    section: 'international',
    title: 'Международное сотрудничество',
    summary: 'Иностранным студентам, партнёры, международные программы и мобильность.',
    blocks: [
      p('Университет развивает международное сотрудничество с вузами и организациями разных стран. Иностранным студентам доступны программы обучения, языковая поддержка и помощь с адаптацией.'),
      h('Направления работы'),
      list(['Приём иностранных студентов.', 'Академическая мобильность.', 'Совместные образовательные программы.', 'Международные проекты и гранты.', 'Работа с партнёрами.']),
      p('Центр международного образования консультирует по вопросам поступления, визы и проживания.')
    ]
  },
  'International cooperation',
  'International students, partners, programmes and mobility.',
  [
    p('The university develops international cooperation with institutions and organisations around the world. International students have access to study programmes, language support and adaptation assistance.'),
    h('Areas of work'),
    list(['Admission of international students.', 'Academic mobility.', 'Joint educational programmes.', 'International projects and grants.', 'Partner relations.']),
    p('The International Education Centre advises on admission, visas and accommodation.')
  ]
))

for (const [slug, title, enTitle, summary, enSummary] of [
  ['students', 'Иностранным студентам', 'International students', 'Поступление, виза, проживание и адаптация.', 'Admission, visa, accommodation and adaptation.'],
  ['partners', 'Партнёры', 'Partners', 'Университеты и организации-партнёры.', 'Partner universities and organisations.'],
  ['programs', 'Международные программы', 'International programmes', 'Программы обмена, гранты и совместные проекты.', 'Exchange programmes, grants and joint projects.'],
  ['mobility', 'Академическая мобильность', 'Academic mobility', 'Входящая и исходящая мобильность.', 'Incoming and outgoing mobility.'],
  ['staff', 'Сотрудникам', 'For staff', 'Возможности для преподавателей и сотрудников.', 'Opportunities for teachers and staff.'],
  ['center', 'Центр международного образования', 'International Education Centre', 'Контакты, услуги и языковая поддержка.', 'Contacts, services and language support.']
]) {
  addPage(bilingual(
    {
      path: `/international/${slug}`,
      section: 'international',
      title,
      summary,
      blocks: [p(`${title}: информация о международной деятельности университета.`), p('Контакты и актуальные документы публикуются управлением международной деятельности.')]
    },
    enTitle,
    enSummary,
    [p(`${enTitle}: information about the university’s international activities.`), p('Contacts and current documents are published by the International Office.')]
  ))
}

addPage(bilingual(
  {
    path: '/news',
    section: 'news',
    title: 'Новости',
    summary: 'Лента новостей университета: приёмная кампания, наука, образование, студенческая жизнь.',
    blocks: [p('Главные события университета, новости приёмной кампании, науки, спорта и культуры.')]
  },
  'News',
  'University news: admissions, research, education and student life.',
  [p('The latest university news: admissions, research, sport and culture.')]
))

addPage(bilingual(
  {
    path: '/news/archive',
    section: 'news',
    title: 'Архив новостей',
    summary: 'Архив новостей университета по годам.',
    blocks: [p('Архив содержит новости прошлых лет. Материалы архива не индексируются поисковыми системами.')],
    template: 'archive'
  },
  'News archive',
  'University news archive by year.',
  [p('The archive contains news from previous years. Archived materials are not indexed by search engines.')]
))

addPage(bilingual(
  {
    path: '/news/video',
    section: 'news',
    title: 'Видео',
    summary: 'Видеоматериалы о жизни университета.',
    blocks: [p('Видеоролики о жизни университета, событиях и образовательных программах.')]
  },
  'Video',
  'Video materials about university life.',
  [p('Videos about university life, events and study programmes.')]
))

addPage(bilingual(
  {
    path: '/contacts',
    section: 'contacts',
    title: 'Контакты',
    summary: 'Приёмная комиссия, телефонный справочник, обратная связь и карта.',
    blocks: [
      p('Государственный морской университет имени адмирала Ф.Ф. Ушакова находится в Новороссийске по адресу: проспект Ленина, 93.'),
      h('Основные контакты'),
      list(['Телефон: +7 (8617) 71-75-25.', 'Электронная почта: mail@nsma.ru.', 'Приёмная комиссия: pcom@nsma.ru.']),
      p('Для вопросов о поступлении используйте контакты приёмной комиссии. Телефонный справочник поможет найти нужное подразделение.')
    ]
  },
  'Contacts',
  'Admissions office, phone directory, feedback and map.',
  [
    p('Admiral Ushakov State Maritime University is located in Novorossiysk at 93 Prospekt Lenina.'),
    h('Main contacts'),
    list(['Phone: +7 (8617) 71-75-25.', 'Email: mail@nsma.ru.', 'Admissions office: pcom@nsma.ru.']),
    p('For admission questions, contact the admissions office. The phone directory helps you find the right unit.')
  ]
))

for (const [slug, title, enTitle, summary, enSummary] of [
  ['admissions', 'Приёмная комиссия', 'Admissions office', 'Контакты, режим работы и приём документов.', 'Contacts, office hours and applications.'],
  ['phonebook', 'Телефонный справочник', 'Phone directory', 'Телефоны подразделений университета.', 'University unit phone numbers.'],
  ['visitors', 'Приём посетителей', 'Visitor hours', 'Правила и время приёма посетителей.', 'Visitor rules and hours.'],
  ['feedback', 'Обратная связь', 'Feedback', 'Форма обратной связи и согласие на обработку данных.', 'Feedback form and data consent.'],
  ['departments', 'Контакты подразделений', 'Unit contacts', 'Контакты факультетов, институтов и управлений.', 'Contacts of faculties, institutes and offices.']
]) {
  addPage(bilingual(
    {
      path: `/contacts/${slug}`,
      section: 'contacts',
      title,
      summary,
      blocks: [p(`${title}: контактная информация университета.`), p('Актуальные телефоны и режим работы уточняйте у подразделения.')],
      template: slug === 'feedback' ? 'contact' : 'default'
    },
    enTitle,
    enSummary,
    [p(`${enTitle}: university contact information.`), p('Check current phone numbers and office hours with the relevant unit.')]
  ))
}

addPage(bilingual(
  {
    path: '/sitemap',
    section: 'about',
    title: 'Карта сайта',
    summary: 'Полный перечень разделов и страниц сайта.',
    blocks: [p('Карта сайта помогает быстро найти нужный раздел. Основные разделы доступны в меню, а полный список страниц — ниже.')]
  },
  'Site map',
  'A complete list of website sections and pages.',
  [p('The site map helps you find the section you need. Main sections are available in the menu; the full list is below.')]
))

addPage(bilingual(
  {
    path: '/sveden',
    section: 'sveden',
    title: 'Сведения об образовательной организации',
    summary: 'Обязательная к раскрытию информация о Государственном морском университете имени адмирала Ф.Ф. Ушакова.',
    blocks: [p('Раздел содержит обязательную информацию об образовательной организации в соответствии с требованиями законодательства Российской Федерации.')]
  },
  'Information about the educational organisation',
  'Mandatory information about Admiral Ushakov State Maritime University.',
  [p('This section contains mandatory information about the educational organisation in accordance with Russian legislation.')]
))

const svedenSections = [
  ['common', 'Основные сведения', 'Basic information'],
  ['struct', 'Структура и органы управления', 'Structure and governance'],
  ['document', 'Документы', 'Documents'],
  ['education', 'Образование', 'Education'],
  ['edustandarts', 'Образовательные стандарты', 'Education standards'],
  ['managers', 'Руководство', 'Leadership'],
  ['employees', 'Педагогический состав', 'Teaching staff'],
  ['objects', 'Материально-техническое обеспечение', 'Facilities and equipment'],
  ['grants', 'Стипендии и меры поддержки', 'Scholarships and support'],
  ['paid_edu', 'Платное обучение', 'Paid education'],
  ['budget', 'Финансово-хозяйственная деятельность', 'Financial and economic activity'],
  ['vacant', 'Вакантные места', 'Vacant places'],
  ['inter', 'Международное сотрудничество', 'International cooperation'],
  ['catering', 'Питание', 'Catering']
]

for (const [slug, title, enTitle] of svedenSections) {
  addPage(bilingual(
    {
      path: `/sveden/${slug}`,
      section: 'sveden',
      title,
      summary: `${title}: официальные сведения Государственного морского университета имени адмирала Ф.Ф. Ушакова.`,
      blocks: [p(`${title}: официальные сведения образовательной организации.`)],
      template: 'sveden'
    },
    enTitle,
    `${enTitle}: official information about Admiral Ushakov State Maritime University.`,
    [p(`${enTitle}: official information about the educational organisation.`)]
  ))
}

addPage(bilingual(
  {
    path: '/privacy',
    section: 'about',
    title: 'Политика обработки персональных данных',
    summary: 'Порядок обработки и защиты персональных данных на сайте университета.',
    blocks: [
      p('Настоящая политика определяет порядок обработки персональных данных пользователей сайта Государственного морского университета имени адмирала Ф.Ф. Ушакова.'),
      h('Какие данные обрабатываются'),
      list(['Данные, которые пользователь добровольно указывает в формах обратной связи.', 'Технические данные о посещении сайта.', 'Данные, необходимые для рассмотрения обращения.']),
      h('Цели обработки'),
      list(['Ответ на обращение пользователя.', 'Улучшение работы сайта.', 'Исполнение требований законодательства.']),
      h('Права пользователя'),
      p('Пользователь вправе запросить уточнение, блокирование или удаление своих персональных данных, направив обращение на официальную электронную почту университета.'),
      callout('info', 'Демо-режим', 'В демонстрационной версии сайта формы не отправляют данные на сервер.')
    ]
  },
  'Personal data processing policy',
  'How the university processes and protects personal data on the website.',
  [
    p('This policy defines how Admiral Ushakov State Maritime University processes personal data of website users.'),
    h('What data is processed'),
    list(['Data voluntarily provided in feedback forms.', 'Technical data about website visits.', 'Data required to process a request.']),
    h('Purposes'),
    list(['Responding to a user request.', 'Improving the website.', 'Compliance with legal requirements.']),
    h('Your rights'),
    p('You may request correction, blocking or deletion of your personal data by contacting the university by email.'),
    callout('info', 'Demo mode', 'In this demo site forms do not transfer data to a server.')
  ]
))

addPage(bilingual(
  {
    path: '/cookies',
    section: 'about',
    title: 'Использование файлов cookie',
    summary: 'Какие cookie использует сайт и как управлять согласием.',
    blocks: [
      p('Сайт использует необходимые файлы cookie для корректной работы интерфейса и сохранения пользовательских настроек.'),
      h('Категории cookie'),
      list(['Необходимые — обеспечивают работу сайта и сохраняют настройки доступности.', 'Аналитические — подключаются только после согласия пользователя.']),
      p('Вы можете изменить решение о согласии, очистив данные сайта в настройках браузера.')
    ]
  },
  'Cookie usage',
  'Which cookies the website uses and how to manage consent.',
  [
    p('The website uses essential cookies to keep the interface working and remember user preferences.'),
    h('Cookie categories'),
    list(['Essential — keep the site working and remember accessibility settings.', 'Analytics — enabled only after user consent.']),
    p('You can change your decision by clearing site data in your browser settings.')
  ]
))

addPage(bilingual(
  {
    path: '/about/sitemap',
    section: 'about',
    title: 'Карта сайта',
    summary: 'Перечень разделов и страниц сайта университета.',
    blocks: [p('Полная карта сайта доступна в разделе «Карта сайта».')]
  },
  'Site map',
  'List of university website sections and pages.',
  [p('The full site map is available in the Site map section.')]
))

const ruPages = pages.map((spec, index) => pageRecord('ru', spec, index))
const enPages = pages.map((spec, index) => pageRecord('en', spec, index))

// Remove duplicate paths if any and write pages.
function writePages(locale, records) {
  const seen = new Set()
  for (const record of records) {
    if (seen.has(record.path)) continue
    seen.add(record.path)
    const file = record.path === '/' ? 'home' : record.path.split('/').filter(Boolean).join('-')
    writeJson(`${locale}/pages/${file}.json`, record)
  }
}

const programsRu = programRecords('ru')
const programsEn = programRecords('en')
const orgUnitsRu = orgUnitRecords('ru')
const orgUnitsEn = orgUnitRecords('en')
const employeesRu = employeeRecords('ru')
const employeesEn = employeeRecords('en')
const newsRu = newsRecords('ru')
const newsEn = newsRecords('en')
const eventsRu = eventRecords('ru')
const eventsEn = eventRecords('en')
const documentsRu = documentRecords('ru')
const documentsEn = documentRecords('en')

function writeCollection(locale, folder, records) {
  for (const record of records) {
    writeJson(`${locale}/${folder}/${record.slug}.json`, record)
  }
}

function svedenRecords(locale) {
  const isEn = locale === 'en'
  const commonFields = [
    { itemprop: 'fullName', label: isEn ? 'Full name' : 'Полное наименование', value: organization.name, type: 'text', required: true },
    { itemprop: 'shortName', label: isEn ? 'Short name' : 'Сокращённое наименование', value: isEn ? 'Admiral Ushakov State Maritime University' : organization.shortName, type: 'text', required: true },
    { itemprop: 'regDate', label: isEn ? 'Founded' : 'Дата создания', value: organization.regDate, type: 'text', required: true },
    { itemprop: 'address', label: isEn ? 'Address' : 'Адрес', value: isEn ? enSite.contacts.address : organization.address, type: 'text', required: true },
    { itemprop: 'website', label: isEn ? 'Website' : 'Сайт', value: organization.website, type: 'link', required: true },
    { itemprop: 'telephone', label: isEn ? 'Phone' : 'Телефон', value: organization.phones.slice(0, 5), type: 'list', required: true },
    { itemprop: 'email', label: isEn ? 'Email' : 'Электронная почта', value: organization.emails.slice(0, 4), type: 'list', required: true },
    { itemprop: 'rector', label: isEn ? 'Rector' : 'Ректор', value: organization.rector.fio, type: 'text', required: true }
  ]
  const structTable = {
    caption: isEn ? 'Structure' : 'Структура',
    headers: isEn ? ['Unit', 'Head', 'Phone', 'Email'] : ['Подразделение', 'Руководитель', 'Телефон', 'Email'],
    rows: divisionsClassified.map((item) => [item.name, item.head || '—', (item.phones || []).join(', ') || '—', (item.emails || []).join(', ') || '—'])
  }
  const programsTable = {
    caption: isEn ? 'Education programmes' : 'Образовательные программы',
    headers: isEn ? ['Code', 'Programme', 'Level', 'Form'] : ['Код', 'Программа', 'Уровень', 'Форма'],
    rows: education.programs.map((item) => [item.code, isEn ? translateProgramName(item.name) : item.name, item.level, item.form])
  }
  const managersTable = {
    caption: isEn ? 'Leadership' : 'Руководство',
    headers: isEn ? ['Name', 'Position', 'Phone', 'Email'] : ['ФИО', 'Должность', 'Телефон', 'Email'],
    rows: managerRecords.map((item) => [item.fio, item.post, item.phones.join(', '), item.emails.join(', ')])
  }
  const employeesTable = {
    caption: isEn ? 'Teaching staff' : 'Педагогический состав',
    headers: isEn ? ['Name', 'Position', 'Degree', 'Title'] : ['ФИО', 'Должность', 'Учёная степень', 'Учёное звание'],
    rows: people.slice(0, 80).map((item) => [item.fio, item.post, item.degree || '—', item.academicTitle || '—'])
  }
  const documentsTable = {
    caption: isEn ? 'Documents' : 'Документы',
    headers: isEn ? ['Document', 'Category', 'Date'] : ['Документ', 'Категория', 'Дата'],
    rows: documentSeeds.map((item) => [item[0], item[3], item[4]])
  }
  const baseFields = commonFields.slice(0, 2)
  const map = {
    common: { itemtype: 'https://schema.org/EducationalOrganization', fields: commonFields, tables: [] },
    struct: { itemtype: 'https://schema.org/EducationalOrganization', fields: baseFields, tables: [structTable] },
    document: { itemtype: 'https://schema.org/EducationalOrganization', fields: baseFields, tables: [documentsTable] },
    education: { itemtype: 'https://schema.org/EducationalOrganization', fields: baseFields, tables: [programsTable] },
    edustandarts: {
      itemtype: 'https://schema.org/EducationalOrganization',
      fields: [
        ...baseFields,
        { itemprop: 'educationalStandard', label: isEn ? 'Federal state educational standards' : 'Федеральные государственные образовательные стандарты', value: isEn ? ['Higher education standards', 'Vocational education standards'] : ['ФГОС высшего образования', 'ФГОС среднего профессионального образования'], type: 'list', required: true }
      ],
      tables: [{
        caption: isEn ? 'Education standards' : 'Образовательные стандарты',
        headers: isEn ? ['Level', 'Standard'] : ['Уровень', 'Стандарт'],
        rows: isEn
          ? [['Bachelor / specialist', 'Federal state educational standard'], ['Master', 'Federal state educational standard'], ['Vocational', 'Federal state educational standard']]
          : [['Бакалавриат / специалитет', 'ФГОС ВО'], ['Магистратура', 'ФГОС ВО'], ['СПО', 'ФГОС СПО']]
      }]
    },
    managers: { itemtype: 'https://schema.org/EducationalOrganization', fields: baseFields, tables: [managersTable] },
    employees: { itemtype: 'https://schema.org/EducationalOrganization', fields: baseFields, tables: [employeesTable] },
    objects: {
      itemtype: 'https://schema.org/EducationalOrganization',
      fields: [
        ...baseFields,
        { itemprop: 'address', label: isEn ? 'Campus address' : 'Адрес кампуса', value: isEn ? enSite.contacts.address : organization.address, type: 'text', required: true },
        { itemprop: 'amenityFeature', label: isEn ? 'Facilities' : 'Объекты инфраструктуры', value: isEn ? ['Training laboratories', 'Library and reading rooms', 'Sports facilities', 'Dormitory'] : ['Учебные лаборатории', 'Библиотека и читальные залы', 'Спортивные объекты', 'Общежитие'], type: 'list', required: true }
      ],
      tables: []
    },
    grants: {
      itemtype: 'https://schema.org/EducationalOrganization',
      fields: [
        ...baseFields,
        { itemprop: 'grants', label: isEn ? 'Scholarships and support' : 'Стипендии и меры поддержки', value: isEn ? ['State academic scholarship', 'Social scholarship', 'Increased scholarship', 'Material assistance'] : ['Государственная академическая стипендия', 'Социальная стипендия', 'Повышенная стипендия', 'Материальная помощь'], type: 'list', required: true }
      ],
      tables: []
    },
    paid_edu: {
      itemtype: 'https://schema.org/EducationalOrganization',
      fields: [
        ...baseFields,
        { itemprop: 'paidEducation', label: isEn ? 'Paid education services' : 'Платные образовательные услуги', value: isEn ? 'Paid education is provided under contracts with individuals and legal entities.' : 'Платные образовательные услуги оказываются по договорам с физическими и юридическими лицами.', type: 'text', required: true }
      ],
      tables: []
    },
    budget: {
      itemtype: 'https://schema.org/EducationalOrganization',
      fields: [
        ...baseFields,
        { itemprop: 'budget', label: isEn ? 'Funding' : 'Финансовое обеспечение', value: isEn ? 'The university is funded from the federal budget and income-generating activities.' : 'Университет финансируется из федерального бюджета и за счёт приносящей доход деятельности.', type: 'text', required: true }
      ],
      tables: []
    },
    vacant: {
      itemtype: 'https://schema.org/EducationalOrganization',
      fields: baseFields,
      tables: [{
        caption: isEn ? 'Vacant places' : 'Вакантные места',
        headers: isEn ? ['Programme', 'Level', 'Budget places', 'Paid places'] : ['Программа', 'Уровень', 'Бюджетные места', 'Платные места'],
        rows: education.programs.slice(0, 10).map((item, index) => [
          isEn ? translateProgramName(item.name) : item.name,
          item.level,
          String(5 + (index % 12)),
          String(10 + (index % 15))
        ])
      }]
    },
    inter: {
      itemtype: 'https://schema.org/EducationalOrganization',
      fields: [
        ...baseFields,
        { itemprop: 'internationalCooperation', label: isEn ? 'International cooperation' : 'Международное сотрудничество', value: isEn ? 'The university cooperates with partner universities and organisations in different countries.' : 'Университет сотрудничает с вузами и организациями разных стран.', type: 'text', required: true }
      ],
      tables: []
    },
    catering: {
      itemtype: 'https://schema.org/EducationalOrganization',
      fields: [
        ...baseFields,
        { itemprop: 'catering', label: isEn ? 'Catering' : 'Питание', value: isEn ? 'Canteens and buffets are available on campus.' : 'На территории кампуса работают столовые и буфеты.', type: 'text', required: true }
      ],
      tables: []
    }
  }
  return svedenSections.map(([section, title, enTitle]) => ({
    id: `sveden-${section}`,
    slug: section,
    status: 'published',
    locale,
    createdAt: now,
    updatedAt: now,
    publishedAt: now,
    path: `/sveden/${section}`,
    sectionId: 'sveden',
    title: isEn ? enTitle : title,
    summary: `${isEn ? enTitle : title}: ${isEn ? 'official information' : 'официальные сведения'}.`,
    body: [p(`${isEn ? enTitle : title}: ${isEn ? 'official information about the educational organisation.' : 'официальные сведения об образовательной организации.'}`)],
    heroImageId: undefined,
    audiences: [],
    tags: [],
    relatedIds: [],
    seo: {
      title: `${isEn ? enTitle : title} — ${isEn ? 'official information' : 'сведения'}`.slice(0, 60),
      description: `${isEn ? enTitle : title}: ${isEn ? 'official information about the university.' : 'официальные сведения университета.'}`.slice(0, 160)
    },
    template: 'sveden',
    sveden: {
      section,
      itemtype: map[section].itemtype,
      fields: map[section].fields,
      tables: map[section].tables
    }
  }))
}

// Clean generated collections before writing.
for (const locale of ['ru', 'en']) {
  for (const folder of ['pages', 'programs', 'org-units', 'employees', 'news', 'events', 'documents', 'sveden']) {
    clearDir(path.join(contentDir, locale, folder))
  }
}

writeJson('ru/site.json', ruSite)
writeJson('en/site.json', enSite)
writeJson('ru/navigation.json', navigation(sectionsRu))
writeJson('en/navigation.json', navigation(sectionsEn))
writeJson('ru/sections.json', sectionsRu)
writeJson('en/sections.json', sectionsEn)

writePages('ru', ruPages)
writePages('en', enPages)
writeCollection('ru', 'programs', programsRu)
writeCollection('en', 'programs', programsEn)
writeCollection('ru', 'org-units', orgUnitsRu)
writeCollection('en', 'org-units', orgUnitsEn)
writeCollection('ru', 'employees', employeesRu)
writeCollection('en', 'employees', employeesEn)
writeCollection('ru', 'news', newsRu)
writeCollection('en', 'news', newsEn)
writeCollection('ru', 'events', eventsRu)
writeCollection('en', 'events', eventsEn)
writeCollection('ru', 'sveden', svedenRecords('ru'))
writeCollection('en', 'sveden', svedenRecords('en'))

writeJson('ru/documents.json', { items: documentsRu, categories: [...new Set(allDocumentSeeds.map((item) => item[3]))] })
writeJson('en/documents.json', { items: documentsEn, categories: [...new Set(allDocumentSeeds.map(() => 'Official documents'))] })
writeJson('ru/faq.json', faqRecords('ru'))
writeJson('en/faq.json', faqRecords('en'))
writeJson('ru/contacts.json', contacts.ru)
writeJson('en/contacts.json', contacts.en)
writeJson('ru/news-categories.json', categoriesRu)
writeJson('en/news-categories.json', categoriesEn)
writeJson('shared/external-services.json', externalServices)

// Journals are curated records shared by both locales with translated labels.
const journals = [
  {
    id: 'journal-1',
    slug: 'vestnik-gmu',
    title: 'Вестник Государственного морского университета',
    titleEn: 'Bulletin of the State Maritime University',
    issn: '2687-0001',
    description: [
      p('Научный журнал публикует статьи по морскому транспорту, судостроению, экологической безопасности, экономике и праву.'),
      p('Журнал ориентирован на исследователей, преподавателей и специалистов морской отрасли.')
    ],
    descriptionEn: [
      p('The academic journal publishes articles on maritime transport, shipbuilding, environmental safety, economics and law.'),
      p('It is intended for researchers, teachers and maritime industry professionals.')
    ],
    issues: [
      { year: 2026, number: '2', title: 'Выпуск 2 (2026)' },
      { year: 2026, number: '1', title: 'Выпуск 1 (2026)' },
      { year: 2025, number: '4', title: 'Выпуск 4 (2025)' }
    ]
  },
  {
    id: 'journal-2',
    slug: 'morskie-tehnologii',
    title: 'Морские технологии и устойчивое развитие',
    titleEn: 'Maritime Technologies and Sustainable Development',
    issn: '2687-0002',
    description: [
      p('Журнал посвящён цифровизации судоходства, интеллектуальным транспортным системам и устойчивому развитию.'),
      p('Публикуются результаты прикладных исследований и обзоры.')
    ],
    descriptionEn: [
      p('The journal focuses on digital shipping, intelligent transport systems and sustainable development.'),
      p('It publishes applied research results and reviews.')
    ],
    issues: [
      { year: 2026, number: '1', title: 'Выпуск 1 (2026)' },
      { year: 2025, number: '2', title: 'Выпуск 2 (2025)' }
    ]
  }
]

function journalRecords(locale) {
  const isEn = locale === 'en'
  return journals.map((item) => ({
    id: item.id,
    slug: item.slug,
    status: 'published',
    locale,
    createdAt: now,
    updatedAt: now,
    publishedAt: now,
    title: isEn ? item.titleEn : item.title,
    issn: item.issn,
    description: isEn ? item.descriptionEn : item.description,
    editorialBoard: [],
    rulesDocumentIds: [],
    ethicsDocumentIds: [],
    issues: item.issues,
    seo: {
      title: (isEn ? item.titleEn : item.title).slice(0, 60),
      description: (isEn ? item.descriptionEn[0].text : item.description[0].text).slice(0, 160)
    }
  }))
}

writeCollection('ru', 'journals', journalRecords('ru'))
writeCollection('en', 'journals', journalRecords('en'))

// Build route map for SSG and artifacts.
const staticRoutes = [...new Set(pages.map((spec) => spec.path))]
const dynamicRoutes = [
  ...programsRu.map((item) => `/education/programs/${item.slug}`),
  ...orgUnitsRu.filter((item) => item.type !== 'military-center').map((item) => item.path),
  ...employeesRu.map((item) => `/about/employees/${item.slug}`),
  ...newsRu.map((item) => `/news/${item.slug}`),
  ...journalRecords('ru').map((item) => `/science/journals/${item.slug}`),
  ...svedenSections.map(([, ,], index) => `/sveden/${svedenSections[index][0]}`)
]
const specialRoutes = ['/search', '/sitemap', '/admissions/faq', '/news/archive']
const ruRoutes = [...new Set([...staticRoutes, ...dynamicRoutes, ...specialRoutes])].sort()
const enStatic = enPages.map((spec) => spec.path)
const enDynamic = [
  ...programsEn.map((item) => `/education/programs/${item.slug}`),
  ...orgUnitsEn.filter((item) => item.type !== 'military-center').map((item) => item.path),
  ...employeesEn.map((item) => `/about/employees/${item.slug}`),
  ...newsEn.map((item) => `/news/${item.slug}`),
  ...journalRecords('en').map((item) => `/science/journals/${item.slug}`)
]
const enRoutes = [...new Set([...enStatic, ...enDynamic, '/search', '/sitemap'])].map((route) => (route === '/' ? '/en' : `/en${route}`))
writeJson('routes.json', [...new Set([...ruRoutes, ...enRoutes])].sort())

console.log(`Content generated: ${ruRoutes.length} RU routes, ${enRoutes.length} EN routes`)
