export type Opportunity = {
  id: string
  title: string
  category: string
  format: string
  deadline: string | null
  description: string | null
  requirements: string | null
  tags: string[]
  apply_url: string | null
  grades: number[] | null
  created_at: string
}

export type Course = {
  id: string
  title: string
  description: string | null
  level: string
  thumbnail_url: string | null
  tags: string[]
  created_at: string
  lessons?: Lesson[]
}

export type Lesson = {
  id: string
  course_id: string
  title: string
  content: string | null
  video_url: string | null
  order_num: number
  quiz: QuizQuestion[]
  created_at: string
}

export type QuizQuestion = {
  q: string
  options: string[]
  answer: number
}

export type UserProfile = {
  id: string
  full_name: string | null
  grade: number | null
  interests: string[]
  goals: string[]
  is_admin: boolean
  onboarding_done: boolean
  created_at: string
}

export type SavedOpportunity = {
  id: string
  user_id: string
  opportunity_id: string
  created_at: string
  opportunity?: Opportunity
}

export type Enrollment = {
  id: string
  user_id: string
  course_id: string
  progress: number
  created_at: string
  course?: Course
}

export const CATEGORIES = ['STEM', 'Бизнес', 'Наука', 'Программирование', 'Социальное', 'Финансы'] as const
export const FORMATS = ['Онлайн', 'Офлайн'] as const
export const GRADES = [8, 9, 10, 11] as const
export const LEVELS = ['Начальный', 'Средний', 'Продвинутый'] as const

export const INTERESTS = [
  { label: 'STEM / Наука', value: 'stem' },
  { label: 'Бизнес', value: 'business' },
  { label: 'Программирование', value: 'programming' },
  { label: 'Финансы', value: 'finance' },
  { label: 'Социальные проекты', value: 'social' },
  { label: 'Английский язык', value: 'english' },
  { label: 'Математика', value: 'math' },
  { label: 'Поступление в вуз', value: 'university' },
]

export const GOALS = [
  { label: 'Поступить в топовый вуз', value: 'top-university' },
  { label: 'Подготовиться к олимпиадам', value: 'olympiads' },
  { label: 'Найти стажировку', value: 'internship' },
  { label: 'Выиграть хакатон', value: 'hackathon' },
  { label: 'Получить стипендию', value: 'scholarship' },
  { label: 'Развить навыки программирования', value: 'coding' },
  { label: 'Улучшить английский', value: 'english' },
]
