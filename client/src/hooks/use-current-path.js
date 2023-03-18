import { matchRoutes, useLocation } from 'react-router-dom';

export default (routes) => {
  const location = useLocation();
  const router = matchRoutes(routes, location);

  return router;
};
