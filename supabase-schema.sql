-- Mentoria Hub — Database Schema
-- Run this in Supabase SQL Editor (supabase.com → SQL Editor → New query)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Opportunities table
create table if not exists opportunities (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  category text not null,
  format text not null,
  deadline date,
  description text,
  requirements text,
  tags text[] default '{}',
  apply_url text,
  created_at timestamptz default now()
);

-- Courses table
create table if not exists courses (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  level text not null default 'Начальный',
  thumbnail_url text,
  tags text[] default '{}',
  created_at timestamptz default now()
);

-- Lessons table
create table if not exists lessons (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references courses(id) on delete cascade,
  title text not null,
  content text,
  video_url text,
  order_num integer not null default 1,
  quiz jsonb default '[]',
  created_at timestamptz default now()
);

-- User profiles table
create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  grade integer,
  interests text[] default '{}',
  goals text[] default '{}',
  is_admin boolean default false,
  onboarding_done boolean default false,
  created_at timestamptz default now()
);

-- Saved opportunities
create table if not exists saved_opportunities (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  opportunity_id uuid references opportunities(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, opportunity_id)
);

-- Course enrollments
create table if not exists enrollments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  progress integer default 0,
  created_at timestamptz default now(),
  unique(user_id, course_id)
);

-- Lesson completions
create table if not exists lesson_completions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  lesson_id uuid references lessons(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, lesson_id)
);

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Row Level Security
alter table opportunities enable row level security;
alter table courses enable row level security;
alter table lessons enable row level security;
alter table user_profiles enable row level security;
alter table saved_opportunities enable row level security;
alter table enrollments enable row level security;
alter table lesson_completions enable row level security;

-- Public read for opportunities, courses, lessons
create policy "Public read opportunities" on opportunities for select using (true);
create policy "Public read courses" on courses for select using (true);
create policy "Public read lessons" on lessons for select using (true);

-- Admin write for opportunities and courses
create policy "Admin write opportunities" on opportunities for all
  using (exists (select 1 from user_profiles where id = auth.uid() and is_admin = true));
create policy "Admin write courses" on courses for all
  using (exists (select 1 from user_profiles where id = auth.uid() and is_admin = true));
create policy "Admin write lessons" on lessons for all
  using (exists (select 1 from user_profiles where id = auth.uid() and is_admin = true));

-- User profiles
create policy "Users read own profile" on user_profiles for select using (auth.uid() = id);
create policy "Users update own profile" on user_profiles for update using (auth.uid() = id);
create policy "Admin read all profiles" on user_profiles for select
  using (exists (select 1 from user_profiles where id = auth.uid() and is_admin = true));

-- Saved opportunities
create policy "Users manage own saved" on saved_opportunities for all using (auth.uid() = user_id);

-- Enrollments
create policy "Users manage own enrollments" on enrollments for all using (auth.uid() = user_id);

-- Lesson completions
create policy "Users manage own completions" on lesson_completions for all using (auth.uid() = user_id);

-- ============================================
-- SEED DATA — Sample opportunities (10 items)
-- ============================================

insert into opportunities (title, category, format, deadline, description, requirements, tags, apply_url) values
('Национальная олимпиада по математике', 'STEM', 'Онлайн', '2025-09-20',
 'Престижная математическая олимпиада для учеников 8–11 классов. Охватывает алгебру, геометрию и комбинаторику.',
 'Учащиеся 8–11 классов. Базовые знания школьной программы.',
 array['math','stem','olympiad'], 'https://example.com'),

('Young Entrepreneurs Challenge', 'Бизнес', 'Офлайн', '2025-10-05',
 'Конкурс бизнес-идей для старшеклассников. Разработай бизнес-план и представь инвесторам.',
 'Команды 2–4 человека. Ученики 9–11 классов.',
 array['business','startup','entrepreneurship'], 'https://example.com'),

('Летняя школа физики МФТИ', 'STEM', 'Офлайн', '2025-08-01',
 'Двухнедельная интенсивная школа при МФТИ. Лекции, лабораторные работы, экскурсии.',
 'Победители региональных олимпиад по физике. 10–11 класс.',
 array['physics','stem','summer-school'], 'https://example.com'),

('Стипендия Болашак — Junior', 'Финансы', 'Онлайн', '2025-11-30',
 'Государственная стипендиальная программа для талантливых учеников Казахстана.',
 'Гражданство РК. Средний балл не ниже 4.5. 10–11 класс.',
 array['scholarship','finance','government'], 'https://example.com'),

('Hackathon AI & Society', 'Программирование', 'Онлайн', '2025-09-15',
 'Разработай AI-решение для социальных проблем. Призовой фонд 500 000 ₸.',
 'Базовые навыки программирования. Команды до 4 человек.',
 array['programming','ai','hackathon'], 'https://example.com'),

('Модель ООН — Астана', 'Социальное', 'Офлайн', '2025-10-20',
 'Симуляция заседаний ООН для развития навыков публичных выступлений и дипломатии.',
 'Уровень английского B1+. 9–11 класс.',
 array['social','mun','leadership'], 'https://example.com'),

('Конкурс научных проектов Science Fair', 'Наука', 'Офлайн', '2025-09-30',
 'Представь свой научный проект перед жюри из учёных и получи возможность публикации.',
 'Готовый исследовательский проект. 8–11 класс.',
 array['science','research','competition'], 'https://example.com'),

('Finance School — основы инвестирования', 'Финансы', 'Онлайн', '2025-08-15',
 'Бесплатная онлайн-школа по личным финансам и основам инвестирования для подростков.',
 'Нет требований. 8–11 класс.',
 array['finance','investing','online'], 'https://example.com'),

('Стажировка в Bahandi Tech', 'Программирование', 'Офлайн', '2025-10-01',
 'Оплачиваемая летняя стажировка для начинающих разработчиков. Менторство от senior-инженеров.',
 'Базовые знания Python или JavaScript. 11 класс / студенты 1 курса.',
 array['programming','internship','tech'], 'https://example.com'),

('Волонтёрский проект EcoAction', 'Социальное', 'Офлайн', '2025-08-30',
 'Экологический волонтёрский проект. Организация мероприятий по раздельному сбору мусора.',
 'Нет требований. Любой класс.',
 array['social','volunteer','ecology'], 'https://example.com');

-- ============================================
-- SEED DATA — Courses (3 courses)
-- ============================================

insert into courses (title, description, level, tags) values
('Математика для поступления', 'Подготовься к ЕНТ и вступительным экзаменам. Алгебра, геометрия, теория вероятностей.', 'Средний', array['math','sat','university']),
('Английский для академического успеха', 'Готовься к IELTS/SAT. Грамматика, эссе, академическое письмо.', 'Начальный', array['english','ielts','sat']),
('Введение в программирование', 'Изучи основы Python с нуля. Алгоритмы, структуры данных, первые проекты.', 'Начальный', array['programming','python','cs']);

-- ============================================
-- SEED DATA — Lessons
-- ============================================

-- Math course lessons
with math_course as (select id from courses where title = 'Математика для поступления' limit 1)
insert into lessons (course_id, title, content, order_num, quiz)
select
  math_course.id,
  title, content, order_num, quiz::jsonb
from math_course, (values
  (1, 'Алгебра: уравнения и неравенства',
   'В этом уроке мы разберём линейные и квадратные уравнения. Линейное уравнение имеет вид ax + b = 0. Квадратное уравнение: ax² + bx + c = 0. Дискриминант D = b² - 4ac определяет количество корней.',
   '[{"q":"Сколько корней имеет уравнение x² - 5x + 6 = 0?","options":["0","1","2","3"],"answer":2},{"q":"Чему равен дискриминант уравнения x² - 4x + 4 = 0?","options":["0","4","8","16"],"answer":0}]'),
  (2, 'Геометрия: площади и объёмы',
   'Площадь треугольника = (основание × высота) / 2. Площадь круга = πr². Объём куба = a³. Объём шара = (4/3)πr³. Теорема Пифагора: a² + b² = c².',
   '[{"q":"Чему равна площадь треугольника с основанием 6 и высотой 4?","options":["10","12","24","48"],"answer":1},{"q":"Чему равна гипотенуза прямоугольного треугольника с катетами 3 и 4?","options":["5","6","7","12"],"answer":0}]'),
  (3, 'Теория вероятностей',
   'Вероятность события P(A) = m/n, где m — число благоприятных исходов, n — общее число исходов. P(A) всегда от 0 до 1. Сумма вероятностей всех исходов = 1.',
   '[{"q":"Монету бросают один раз. Вероятность орла равна:","options":["0","0.25","0.5","1"],"answer":2},{"q":"В мешке 3 красных и 7 синих шаров. Вероятность вытащить красный:","options":["0.1","0.3","0.7","1"],"answer":1}]')
) as t(order_num, title, content, quiz);

-- English course lessons
with eng_course as (select id from courses where title = 'Английский для академического успеха' limit 1)
insert into lessons (course_id, title, content, order_num, quiz)
select
  eng_course.id,
  title, content, order_num, quiz::jsonb
from eng_course, (values
  (1, 'Академическое письмо: структура эссе',
   'Академическое эссе состоит из: Introduction (введение с тезисом), Body paragraphs (2-3 абзаца с аргументами), Conclusion (вывод). Каждый абзац начинается с topic sentence — главной мысли абзаца.',
   '[{"q":"Из скольких основных частей состоит академическое эссе?","options":["2","3","4","5"],"answer":1},{"q":"Как называется первое предложение абзаца, выражающее его главную мысль?","options":["thesis","topic sentence","conclusion","hook"],"answer":1}]'),
  (2, 'Грамматика: времена глаголов',
   'Present Simple используется для регулярных действий. Present Continuous — для действий в момент речи. Past Simple — завершённые действия в прошлом. Present Perfect — действия, связанные с настоящим.',
   '[{"q":"Какое время используется для регулярных действий?","options":["Present Continuous","Past Simple","Present Simple","Future Simple"],"answer":2},{"q":"I ___ my homework now. Выбери правильный вариант:","options":["do","did","am doing","have done"],"answer":2}]'),
  (3, 'IELTS Reading: стратегии',
   'Стратегии IELTS Reading: Skimming (быстрое прочтение для общего понимания), Scanning (поиск конкретной информации), Reading for detail (детальное чтение). Всегда читай вопросы перед текстом.',
   '[{"q":"Какая стратегия используется для быстрого понимания общего содержания текста?","options":["Scanning","Skimming","Detailed reading","Guessing"],"answer":1},{"q":"Что нужно делать перед чтением текста на IELTS?","options":["Пропустить введение","Читать вопросы","Считать слова","Переводить всё"],"answer":1}]')
) as t(order_num, title, content, quiz);

-- Programming course lessons
with prog_course as (select id from courses where title = 'Введение в программирование' limit 1)
insert into lessons (course_id, title, content, order_num, quiz)
select
  prog_course.id,
  title, content, order_num, quiz::jsonb
from prog_course, (values
  (1, 'Python: переменные и типы данных',
   'В Python переменные создаются присваиванием: x = 5. Типы данных: int (целые числа), float (дробные), str (строки), bool (True/False). Функция type() показывает тип переменной.',
   '[{"q":"Какой тип данных у переменной x = 3.14?","options":["int","float","str","bool"],"answer":1},{"q":"Как вывести текст на экран в Python?","options":["echo()","console.log()","print()","write()"],"answer":2}]'),
  (2, 'Условия и циклы',
   'Условие if: if x > 0: print("положительное"). Цикл for: for i in range(5): print(i). Цикл while: while x > 0: x -= 1. Отступы в Python обязательны!',
   '[{"q":"range(5) генерирует числа от:","options":["1 до 5","0 до 4","0 до 5","1 до 4"],"answer":1},{"q":"Какой символ используется для блоков кода в Python?","options":["{}","()","[]","отступы"],"answer":3}]'),
  (3, 'Функции и списки',
   'Функция: def my_func(x): return x * 2. Список: fruits = ["яблоко", "банан", "апельсин"]. Добавить элемент: fruits.append("арбуз"). Длина списка: len(fruits).',
   '[{"q":"Какое ключевое слово используется для создания функции в Python?","options":["function","def","func","create"],"answer":1},{"q":"Как добавить элемент в конец списка?","options":["list.add()","list.insert()","list.append()","list.push()"],"answer":2}]')
) as t(order_num, title, content, quiz);
