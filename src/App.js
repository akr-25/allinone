import { BrowserRouter as Router, Route } from 'react-router-dom';
import { useEffect, useState } from 'react'
import db from './db';
import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore';
import { useCookies } from 'react-cookie';
import { v4 as uuidv4 } from 'uuid';
import './app.css';


function App() {
  const [opened, setOpened] = useState(false);
  const initialSeconds = 5;
  const [seconds, setSeconds] = useState(100);
  const [count, setCount] = useState(-1);
  const [cookies, setCookie] = useCookies(['brw_uid', 'brw_ricked']);

  const updateDB = async () => {
    let date = new Date();
    date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    db.collection("count").doc(date).update({
      num_of_ricked: firebase.firestore.FieldValue.increment(1)
    });
    db.collection("aggregate").doc("ricked").update({
      num_of_ricked: firebase.firestore.FieldValue.increment(1)
    });
    window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_self");
    setOpened(true);
  }

  // initial count
  useEffect(() => {
    const getCount = async () => {
      let date = new Date();
      date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      let count = await db.collection('count').doc(date).get();
      if (count.data() === undefined) {
        await db.collection('count').doc(date).set({
          num_of_visitors: 0,
          num_of_ricked: 0
        })
      }
      let rick = await db.collection("aggregate").doc("ricked").get();
      if (cookies.brw_uid === undefined) {

        await setCookie('brw_uid', uuidv4().toString(), { path: '/', maxAge: 1000 * 60 * 60 * 1 });

        await db.collection("aggregate").doc("visitor").update({
          num_of_visitors: firebase.firestore.FieldValue.increment(1)
        });

        await db.collection("count").doc(date).update({
          num_of_visitors: firebase.firestore.FieldValue.increment(1)
        });
      }
      console.log(rick.data());
      setCount(rick.data()["num_of_ricked"]);
      setSeconds(initialSeconds);
    }

    getCount();
  }, [setCookie, cookies.brw_uid])

  // timer
  useEffect(() => {
    let myInterval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }
    }, 1000)

    return () => {
      clearInterval(myInterval);
    };
  });

  // increment count
  useEffect(() => {
    if (seconds <= 0 && !opened) {
      updateDB();
      let brw_ricked = cookies.brw_ricked;
      if (brw_ricked === undefined) {
        setCookie('brw_ricked', 1, { path: '/', maxAge: 1000 * 60 * 60 * 1 });
      }
      else {
        setCookie('brw_ricked', Number(brw_ricked) + 1, { path: '/', maxAge: 1000 * 60 * 60 * 1 });
      }
    }
  }, [seconds, opened, cookies.brw_ricked, setCookie])

  return (
    <Router>
      <Route path="*">
        <Component count={count} seconds={seconds} />
      </Route>
    </Router>
  );
}

const Component = ({ count, seconds }) => {
  console.log(count);
  if (count === -1) {
    return (
      <div class="container">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    )
  }
  else {
    return (<div style={{ height: "100vh", overflow: "hidden" }}>
      <div style={{ display: "grid", placeItems: "center", height: "100%" }}>
        <code style={{ display: "grid", placeItems: "center", overflow: "visible" }}>
          <h1 style={{ fontSize: "30px" }}>Crack the code in {seconds} seconds!!!</h1>
          <h1 style={{ fontSize: "60px" }}>{count}</h1>
        </code>
      </div>
    </div>
    )
  }
}

export default App;
