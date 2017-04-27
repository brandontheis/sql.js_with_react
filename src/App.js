import React, { Component } from 'react';
import Button from './Button';
import Cursor from './Cursor';
import SQLOutput from './SQLOutput';
import SQLText from './SqlText';
import SimplerCodeMirror from './SimplerCodeMirror';
import logo from './udacity_logo.png';
import './App.css';
import '../node_modules/codemirror/lib/codemirror.css';
import * as SQL from 'sql.js';
import InitDb from './InitDb';

class App extends Component {

  constructor(props) {
    super(props);

    var inlineDb = false;
    if (inlineDb) {
      this.state = {
        newUserQuery: "-- Enter your SQL below, for instance:\nSELECT id, name,website from accounts ORDER BY name ASC;",
        db: new SQL.Database(),
        remoteDbFile: undefined,
        inlineDb: true,     // set this to true if queries can run as soon as the user types something
        recording: false,
        playingBack: false
      };
    } else {
      this.state = {
        newUserQuery: "-- Enter your SQL below, for instance:\nSELECT id, name,website from accounts ORDER BY name ASC;",
        db: undefined,
        remoteDbFile: 'parch_and_posey_4_20_17a.db',
        inlineDb: false,     // set this to true if queries can run as soon as the user types something
        recording: false,
        playingBack: false
      };
    }
    this.handleUserQuery = this.handleUserQuery.bind(this);
    this.loadDbHandler = this.loadDbHandler.bind(this);
    this.saveUserQueryForEvaluator = this.saveUserQueryForEvaluator.bind(this);
    this.cursorMotionIndex = -1;
  }

  componentDidMount() {
    this.registerCursorMotion();
  }

  registerCursorMotion() {
    this.cursorMotion = [];
    this.node.onmousemove = (e) => this.recordCursorMotion(e);
  }

  recordCursorMotion(e) {
    if (this.state.recording) {
      var cursorPos = { x: e.pageX, y: e.pageY };
      this.cursorMotion.push (cursorPos);
      console.log(cursorPos);
    }
  }

  startRecording() {
    this.cursorMotionIndex = -1;
    this.cursorMotion = [];
    console.log('start recording');
    this.setState({recording:true});
  }

  stopRecording() {
    console.log('stop recording');
    this.setState({recording:false});
  }

  playRecording() {
    console.log('play recording');
    this.setState({recording:false, playingBack:!this.state.playingBack});
  }

  getPosition() {
    //console.log('app:getPosition');
    if ((this.cursorMotion.length > 0) && (this.cursorMotionIndex < this.cursorMotion.length) && (this.state.playingBack)) {
      //console.log('sending position back');
      this.cursorMotionIndex++;
      if (this.cursorMotionIndex >= this.cursorMotion.length) {
        this.cursorMotionIndex = 0;
      }
      return(this.cursorMotion[this.cursorMotionIndex]);
    }
    return({x:0,y:0});
  }

  loadDbHandler(uInt8Array) {
    this.setState({db: new SQL.Database(uInt8Array)});;
    console.log('Loaded big db file:', this.state.remoteDbFile);
  }

  handleUserQuery(newUserQuery) {
    //console.log('handleUserQuery: Setting user query to:', newUserQuery);
    this.setState({userQuery:newUserQuery});
  }

  saveUserQueryForEvaluator(newUserQuery) {
    //console.log('Saving query for later:', newUserQuery);
    this.setState({newUserQuery:newUserQuery});
  }

  sqlEvaluator() {
    this.setState({userQuery: this.state.newUserQuery});
  }

  render() {
    //console.log(this.state.userQuery);
    return (
      <div className="App" ref={(node) => {this.node = node;}} >
        {this.props.useHeader !== "0" ?
          <div className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <h3>Pure Client SQL Evaluator</h3>
          </div>
          : null
        }
      <Cursor id="cursor" getPosition={() => this.getPosition() } / >
      <InitDb db={this.state.db} inlineDb={this.state.inlineDb} loadDbHandler={this.loadDbHandler} remoteDbFile={this.state.remoteDbFile} />
      <p className="App-intro"></p>
      <SQLText saveUserQueryForEvaluator={this.saveUserQueryForEvaluator} handleUserQuery={this.handleUserQuery} inlineDb={this.state.inlineDb} query={this.state.newUserQuery}/>
      <Button click={() => this.sqlEvaluator()   } label={"Evaluate SQL (Ctrl-Enter)"} />
      <Button click={() => this.startRecording() } label={"Start recording"} />
      <Button click={() => this.stopRecording()  } label={"Stop recording"} />
      <Button click={() => this.playRecording()  } label={(this.state.playingBack ? 'Stop' : 'Start') + ' playback'} />
      <SimplerCodeMirror />
      <div className="SqlOutput"><SQLOutput userQuery={this.state.userQuery} db={this.state.db}/></div>
      </div>
    );
  }
}

export default App;
