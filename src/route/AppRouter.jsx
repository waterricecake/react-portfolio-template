import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {ParamProvider} from './ParamProvider'

export const AppRouter = ({children}) => (
    <Router>
        <Routes>
            <Route
                path="/:userId/*"
                element={
                    <ParamProvider>
                        {children}
                    </ParamProvider>
                }
            />
        </Routes>
    </Router>
);