import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Category } from '../models/category.model';

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'math', name: 'Math', color: '#E3F2FD', icon: '/assets/icons/math.svg', subtopics: ['Arithmetic','Pre-Algebra','Algebra I','Algebra II','Geometry','Trigonometry','Precalculus','Calculus','Statistics','Linear Algebra'] },
  { id: 'science', name: 'Science', color: '#E8F5E9', icon: '/assets/icons/science.svg', subtopics: ['Biology','Chemistry','Physics','Earth Science','Environmental Science','Anatomy & Physiology','Astronomy','Physical Science'] },
  { id: 'english', name: 'English & Language Arts', color: '#FFF3E0', icon: '/assets/icons/english.svg', subtopics: ['Vocabulary','Grammar','Reading Comprehension','Writing','Spelling','Literature','Poetry','Phonics'] },
  { id: 'social-studies', name: 'Social Studies', color: '#F3E5F5', icon: '/assets/icons/social-studies.svg', subtopics: ['History','World History','U.S. History','Civics & Government','Geography','Economics','Political Science'] },
  { id: 'languages', name: 'Languages', color: '#E1F5FE', icon: '/assets/icons/languages.svg', subtopics: ['Spanish','French','German','Chinese (Mandarin)','Japanese','Korean','Latin','ESL / ELL','Sign Language'] },
  { id: 'test-prep', name: 'Test Prep', color: '#FCE4EC', icon: '/assets/icons/test-prep.svg', subtopics: ['SAT','ACT','PSAT','GRE','GMAT','LSAT','MCAT','TOEFL','IELTS','AP Exams','IB Exams'] },
  { id: 'computer-science', name: 'Computer Science & Tech', color: '#E0F2F1', icon: '/assets/icons/computer-science.svg', subtopics: ['Programming Basics','Python','JavaScript','Java','C / C++','Data Structures','Algorithms','Databases','Web Development','Cybersecurity','AI / Machine Learning'] },
  { id: 'health', name: 'Health & Medicine', color: '#F1F8E9', icon: '/assets/icons/health.svg', subtopics: ['Nursing','Medical Terminology','Anatomy','Physiology','Pharmacology','Public Health','Psychology','Biology (Pre-Med)'] },
  { id: 'business', name: 'Business & Finance', color: '#FFFDE7', icon: '/assets/icons/business.svg', subtopics: ['Accounting','Economics','Finance','Marketing','Management','Entrepreneurship','Business Law'] },
  { id: 'arts', name: 'Arts & Humanities', color: '#FBE9E7', icon: '/assets/icons/arts.svg', subtopics: ['Art History','Music Theory','Theater','Dance','Philosophy','Religion','Ethics'] },
  { id: 'law', name: 'Law & Government', color: '#ECEFF1', icon: '/assets/icons/law.svg', subtopics: ['Law Studies','Constitutional Law','Criminal Justice','International Relations','Public Policy'] },
  { id: 'skilled-trades', name: 'Skilled Trades', color: '#EDE7F6', icon: '/assets/icons/skilled-trades.svg', subtopics: ['Engineering Basics','Electrical','Mechanical','Automotive','Construction','Robotics','CAD / Design'] },
  { id: 'life-skills', name: 'Life Skills', color: '#E0F7FA', icon: '/assets/icons/life-skills.svg', subtopics: ['Study Skills','Time Management','Financial Literacy','Resume & Interview Prep','Personal Development'] },
  { id: 'learning-support', name: 'Special Learning Support', color: '#FFF8E1', icon: '/assets/icons/learning-support.svg', subtopics: ['Dyslexia Support','ADHD Study Tools','Special Education','ESL Support','Speech & Language'] }
];

const STORAGE_KEY = 'aurora:flashcards:categories:v1';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private _categories$ = new BehaviorSubject<Category[]>(this.load() || DEFAULT_CATEGORIES);

  /** Observable interface */
  readonly categories$ = this._categories$.asObservable();

  // No signal wrapper here to keep compatibility with current Angular setup.

  constructor() {}

  private load(): Category[] | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Category[];
      return Array.isArray(parsed) && parsed.length ? parsed : null;
    } catch (e) {
      return null;
    }
  }

  private save(list: Category[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      // ignore storage errors
    }
  }

  getAllCategories(): Category[] {
    return [...this._categories$.getValue()];
  }

  getCategoryById(id: string): Category | undefined {
    return this._categories$.getValue().find(c => c.id === id);
  }

  list(): Category[] { return this.getAllCategories(); }

  add(c: Category) {
    const list = this.getAllCategories();
    list.push(c);
    this._categories$.next(list);
    this.save(list);
  }

  update(id: string, patch: Partial<Category>) {
    const list = this.getAllCategories();
    const i = list.findIndex(x => x.id === id);
    if (i === -1) return;
    list[i] = { ...list[i], ...patch };
    this._categories$.next(list);
    this.save(list);
  }

  remove(id: string) {
    const list = this.getAllCategories().filter(x => x.id !== id);
    this._categories$.next(list);
    this.save(list);
  }
}
