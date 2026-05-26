import { RouterProvider } from 'react-router';
import { router } from './routes.tsx';
import { StoreProvider } from './context/StoreContext';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <RouterProvider router={router} />
      </StoreProvider>
    </ErrorBoundary>
  );
}
