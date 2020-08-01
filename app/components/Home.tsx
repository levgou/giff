import React, { ChangeEvent, useState } from 'react';
import styles from './Home.css';
import { useToasts } from 'react-toast-notifications';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

import { GiphyFetch } from '@giphy/js-fetch-api';
import { Gif } from '@giphy/react-components';
import { GridListTile, GridList, GridListTileBar } from '@material-ui/core';

const { clipboard } = require('electron');

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

function GridDemo({ addToast, gifs, showNumbers }) {
  const gifsAndNumbers = [];
  let num = 0;
  for (const f of gifs) {
    gifsAndNumbers.push([f, num]);
    num += 1;
  }

  const gridTileBarStyles = withStyles({
    root: {
      height: '100%',
    },
    titleWrap: {
      height: '100%',
    },
    title: {
      fontSize: 80,
      height: '100%',
      paddingTop: '25%',
    },
  });

  const StyledTileBar = gridTileBarStyles(GridListTileBar);

  return (
    <GridList cellHeight={160} cols={3}>
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
          {showNumbers ? <StyledTileBar title={`- ${num} -`} /> : null}
        </GridListTile>
      ))}
    </GridList>
  );
}

const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(() => resolve(), ms));

let latestTerm: string = '';

async function searchChanged(
  e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
) {
  const term = e.target.value;
  latestTerm = term;
  await waitFor(200);
  if (latestTerm !== term) {
    return null;
  }

  return term;
}

function isOptKey(e) {
  return e.key === 'Alt';
}

const ArrowStyles = {
  background: 'rgba(0,0,0,0.5)',
  display: 'inline-block',
  margin: '0 1em 1em 0',
  height: '90px',
  width: '45px',

  padding: '10px',
  marginTop: '35%',
  lineHeight: '80px',
  fontSize: 40,
  fontWeight: 'bold',
  cursor: 'pointer',
};

const LeftArrow = ({ onClick }) => {
  const style = {
    ...ArrowStyles,
    borderBottomRightRadius: '90px',
    borderTopRightRadius: '90px',
  };

  return (
    <div style={style} onClick={onClick}>
      {'<'}
    </div>
  );
};

const RightArrow = ({ onClick }) => {
  const style = {
    ...ArrowStyles,
    borderBottomLeftRadius: '90px',
    borderTopLeftRadius: '90px',
    marginRight: 0,
  };
  return (
    <div style={style} onClick={onClick}>
      {'>'}
    </div>
  );
};

function _Home(): JSX.Element {
  const [gifs, setGifs] = useState([]);
  const [searchWord, setSearchWord] = useState('');
  const [offset, setOffset] = useState(0);
  const [keyAcc, setKeyAcc] = useState(false);
  const { addToast } = useToasts();

  const searchGifs = ({ newWord, newOffset }) =>
    giphyFetch
      .search(newWord || searchWord, { offset: newOffset || offset, limit: 10 })
      .then((gifs) => {
        console.log(
          `<${newWord || searchWord}>`,
          newOffset || offset,
          gifs.data
        );
        setGifs(gifs.data);
      });

  const handleNumber = (num: number) => {
    clipGif(gifs[num]);
    addToast(`Copied To Clipboard - ${num}`, {
      appearance: 'success',
      autoDismiss: true,
      autoDismissTimeout: 3000,
    });
  };

  return (
    <div className={styles.container} data-tid="container">
      <TextField
        style={{ width: '100%' }}
        id="outlined-basic"
        label="Search Giphy"
        variant="outlined"
        onChange={async (e) => {
          const newWord = await searchChanged(e);
          console.log(88, newWord);
          if (newWord) {
            setSearchWord(newWord);
            await searchGifs({ newWord });
          }
        }}
        onKeyDown={(e) => {
          console.log(e.keyCode);
          if (isOptKey(e)) {
            setKeyAcc(true);
          } else if (e.altKey) {
            e.preventDefault();

            if (e.keyCode >= 48 && e.keyCode <= 57) {
              // number
              handleNumber(e.keyCode - 48);
            } else if (e.keyCode === 39) {
              // right
              const newOffset = offset + 10;
              setOffset(newOffset);
              searchGifs({ newOffset });
            } else if (e.keyCode === 37) {
              // left
              const newOffset = Math.max(0, offset - 10);
              setOffset(newOffset);
              searchGifs({ newOffset });
            }
          }
        }}
        onKeyUp={(e) => {
          if (isOptKey(e)) {
            setKeyAcc(false);
          }
        }}
        autoFocus
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        {gifs.length ? (
          <LeftArrow
            onClick={() => {
              const newOffset = Math.max(0, offset - 10);
              setOffset(newOffset);
              searchGifs({ newOffset });
            }}
          />
        ) : null}
        <GridDemo
          showNumbers={keyAcc}
          onGifClick={(e) => e.preventDefault()}
          addToast={addToast}
          gifs={gifs}
        />
        {gifs.length ? (
          <RightArrow
            onClick={() => {
              const newOffset = offset + 10;
              setOffset(newOffset);
              searchGifs({ newOffset });
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

const Home = _Home;
export default Home;
