import './App.css';
import 'antd/dist/antd.css';
import TextAreaComponent from './components/textArea'
import FileListComponent from './components/fileList';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";


function App() {

  return (
    <div className="App">
      <Router>
       <Switch>
          <Route exact path="/">
            <FileListComponent />
          </Route>
          <Route path="/edit/:name">
            <TextAreaComponent />
          </Route>
        </Switch>
     </Router> 
    </div>
  );
}

export default App;
