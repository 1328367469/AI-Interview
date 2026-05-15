/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './MainLayout';
import HomeView from './views/HomeView';
import ToolsView from './views/ToolsView';
import ProfileView from './views/ProfileView';
import QuestionBankView from './views/QuestionBankView';
import LearnView from './views/LearnView';
import CareerPlanView from './views/CareerPlanView';
import ReportView from './views/ReportView';
import ResumeParserView from './views/ResumeParserView';
import ActiveInterviewView from './views/ActiveInterviewView';
import InterviewConfigView from './views/InterviewConfigView';
import OnboardingView from './views/OnboardingView';
import { isNative, requestSpeechPermissions } from './services/nativeService';
import { vectorService } from './services/vectorService';

export default function App() {
  useEffect(() => {
    if (isNative()) {
      requestSpeechPermissions().catch(console.error);
    }
    // Sync vector database
    vectorService.syncInitialData().catch(console.error);
  }, []);

  return (
    <ThemeProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </ThemeProvider>
  );
}
