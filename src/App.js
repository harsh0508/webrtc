import logo from './logo.svg';
import './App.css';
import Join from './Pages/Join/Join';
import Room from './Pages/Room/Room';
import { BrowserRouter , Route, Routes } from 'react-router-dom';
import AnswerRoom from './Pages/Room/AnswerRoom';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Join/>}/>
          <Route path='/Room/:id' element= {<Room/>}/>
          <Route path = 'AnswerRoom/:id' element = {<AnswerRoom/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
