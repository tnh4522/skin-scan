import React, { useState } from 'react';
import Navigation from './components/Navigation/Navigation';
import Home from './pages/Home/Home';
import History from './pages/History/History';
import Analysis from './pages/Analysis/Analysis';
import Advice from './pages/Advice/Advice';
import Footer from './components/Footer/Footer.jsx';

function App() {
    const [activeSection, setActiveSection] = useState('home');

    return (
        <div className="bg-gray-100">
            <Navigation activeSection={activeSection} setActiveSection={setActiveSection} />
            <Home activeSection={activeSection} setActiveSection={setActiveSection} />
            <History activeSection={activeSection} />
            <Analysis activeSection={activeSection} setActiveSection={setActiveSection} />
            <Advice activeSection={activeSection} />
            <Footer />
        </div>
    );
}

export default App;