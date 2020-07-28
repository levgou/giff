import React, { ChangeEvent, useRef, useState } from 'react';
import styles from './Home.css';
import { useToasts } from 'react-toast-notifications';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

import { ToastProvider } from 'react-toast-notifications';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Gif } from '@giphy/react-components';
import { GridListTile, GridList, GridListTileBar } from '@material-ui/core';
import { HotKeys } from 'react-hotkeys';

const { clipboard } = require('electron');

const useFocus = () => {
  const htmlElRef = useRef(null);
  const setFocus = () => {
    htmlElRef.current && htmlElRef.current.focus();
  };

  return [htmlElRef, setFocus];
};

const apiKey = 'NuhGU90A7e5louk12CTMt8pdO3czWZsh';
const giphyFetch = new GiphyFetch(apiKey);

function getPathFromUrl(url) {
  return url.split(/[?#]/)[0];
}

function addMDthings(url: string) {
  return `/md ![Alt Text](${url})`;
}

function clipGif(gif) {
  const url = getPathFromUrl(gif.images.original.url);
  console.log(222, url);
  clipboard.writeText(addMDthings(url));
}

function gifClicked(gif, e) {
  e.preventDefault();
  clipGif(gif);
}

function GridDemo({ onGifClick, gifs, showNumbers, r }) {
  const { addToast } = useToasts();

  const gifsAndNumbers = [];
  let num = 0;
  for (const f of gifs) {
    gifsAndNumbers.push([f, num]);
    num += 1;
  }

  const handleNumber = (num: number) => {
    clipGif(gifs[num]);
    addToast(`Copied To Clipboard - ${num}`, {
      appearance: 'success',
      autoDismiss: true,
      autoDismissTimeout: 3000,
    });
  };

  const handlers = {
    SELECT_1: () => handleNumber(1),
    SELECT_2: () => handleNumber(2),
    SELECT_3: () => handleNumber(3),
    SELECT_4: () => handleNumber(4),
    SELECT_5: () => handleNumber(5),
    SELECT_6: () => handleNumber(6),
    SELECT_7: () => handleNumber(7),
    SELECT_8: () => handleNumber(8),
    SELECT_9: () => handleNumber(9),
    SELECT_0: () => handleNumber(0),
  };

  return (
    <HotKeys handlers={handlers}>
      <GridList cellHeight={160} cols={3} ref={r}>
        {gifsAndNumbers.map(([gif, num]) => (
          <GridListTile key={gif.url} cols={1}>
            <Gif
              gif={gif}
              width={200}
              onGifClick={(gif, e) => {
                gifClicked(gif, e);
                addToast('Copied To Clipboard', {
                  appearance: 'success',
                  autoDismiss: true,
                  autoDismissTimeout: 3000,
                });
              }}
            />
            {showNumbers ? <GridListTileBar title={`- ${num} -`} /> : null}
          </GridListTile>
        ))}
      </GridList>
    </HotKeys>
  );
}

const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(() => resolve(), ms));

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
      width: '90%',
    },
  },
}));

let latestTerm: string = '';

function searchChangedHandle(stateSetter: (x: Array<any>) => void) {
  async function searchChanged(
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) {
    const term = e.target.value;
    latestTerm = term;
    await waitFor(200);
    if (latestTerm !== term) {
      return;
    }

    giphyFetch.search(term, { offset: 0, limit: 10 }).then((y) => {
      console.log(y.data);
      stateSetter(y.data);
    });
  }

  return searchChanged;
}

function enterPressed(e) {
  return e.key === 'Enter';
}

function _Home(): JSX.Element {
  const [gifs, setGifs] = useState([]);
  const [showNumbers, setShowNumbers] = useState(false);
  const classes = useStyles();
  const [r, setFocus] = useFocus();

  return (
    <ToastProvider placement="bottom-center">
      <div className={styles.container} data-tid="container">
        <TextField
          style={{ width: '100%' }}
          id="outlined-basic"
          label="Search Giphy"
          variant="outlined"
          onChange={searchChangedHandle(setGifs)}
          onKeyDown={(e) => {
            if (enterPressed(e)) {
              setShowNumbers(true);
              if (
                document &&
                document.activeElement &&
                document.activeElement.blur
              ) {
                document.activeElement.blur();
                setFocus();
              }
            }
          }}
          autoFocus
        />
        <GridDemo
          showNumbers={showNumbers}
          onGifClick={(e) => e.preventDefault()}
          gifs={gifs}
          r={r}
        />
      </div>
    </ToastProvider>
  );
}

const Home = _Home;
export default Home;
