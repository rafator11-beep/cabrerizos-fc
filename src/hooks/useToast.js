import { useAppContext } from '../context/AppContext';

export const useToast = () => {
  const { showToast } = useAppContext();
  return { showToast };
};
