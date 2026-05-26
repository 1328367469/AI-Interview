export type ViewState = 
  | 'auth'
  | 'onboarding'
  | 'home' 
  | 'tools' 
  | 'learn'
  | 'profile' 
  | 'interview-config' 
  | 'active-interview' 
  | 'report' 
  | 'resume-opt'
  | 'career-plan'
  | 'jd-match'
  | 'question-bank'
  | 'questions'
  | 'resume-parser'
  | 'resume-library';

export interface AppContextType {
  currentView: ViewState;
  navigate: (view: ViewState) => void;
}
