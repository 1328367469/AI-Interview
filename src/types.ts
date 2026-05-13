export type ViewState = 
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
  | 'question-bank';

export interface AppContextType {
  currentView: ViewState;
  navigate: (view: ViewState) => void;
}
