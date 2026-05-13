/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './MainLayout';

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </ThemeProvider>
  );
}
