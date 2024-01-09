import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import {FruitsPage} from "./pages/FruitsPage";
import {PersonalPage} from "./pages/PersonalPage";
import { PageNotFound } from './pages/PageNotFound'
import DetailsPage from "./pages/DetailsPage";



function App() {
  return (
    <Router>
        <Routes>
            <Route index element={<HomePage />}/>
            <Route path='/home' exact element={<HomePage />}/>
            <Route path='/fruits' element={<FruitsPage/>} />
            <Route path='/fruits/:id' element={<DetailsPage/>} />
            <Route path='/personal' element={< PersonalPage/>} />
            <Route path='/personal/:id' element={<DetailsPage/>} />
            <Route path='/*' exact element={<PageNotFound />}/>
        </Routes>
    </Router>
  );
}

export default App;


