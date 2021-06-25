import getRepositories from '../repositories/';
import { AppContext } from '../../domain/types/appContext';

export default {
  async init(): Promise<AppContext> {
    const appContext: AppContext = {
      repositories: getRepositories(),
    };

    return appContext;
  },
};
