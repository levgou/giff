/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './containers/App';
import HomePage from './containers/HomePage';
import { HotKeys } from 'react-hotkeys';

// Lazily load routes and code split with webpacck
const LazyCounterPage = React.lazy(() =>
  import(/* webpackChunkName: "CounterPage" */ './containers/CounterPage')
);

const CounterPage = (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyCounterPage {...props} />
  </React.Suspense>
);


const keyMap = {
  SELECT_1: '1',
  SELECT_2: '2',
  SELECT_3: '3',
  SELECT_4: '4',
  SELECT_5: '5',
  SELECT_6: '6',
  SELECT_7: '7',
  SELECT_8: '8',
  SELECT_9: '9',
  SELECT_0: '0',
};

export default function Routes() {
  return (
    <HotKeys keyMap={keyMap}>
    <App>
      <Switch>
        <Route path={routes.COUNTER} component={CounterPage} />
        <Route path={routes.HOME} component={HomePage} />
      </Switch>
    </App>
    </HotKeys>
  );
}
