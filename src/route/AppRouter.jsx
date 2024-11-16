import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React from 'react';

const AppRouter = ({ children }) => (
  <Router basename={import.meta.env.BASE_URL}>
    <Routes>
      <Route path=":userId/*" element={children} />
    </Routes>
  </Router>
);

export default AppRouter;