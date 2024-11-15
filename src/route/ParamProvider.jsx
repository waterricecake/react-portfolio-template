import React, { createContext, useContext } from 'react';
import { useParams } from 'react-router-dom';

const ParamContext = createContext();

export const ParamProvider = ({ children }) => {
    const params = useParams(); 
    return <ParamContext.Provider value={params}>{children}</ParamContext.Provider>;
};

export const useURLParams = () => useContext(ParamContext);