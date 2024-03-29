import React, { useState, useEffect, useRef } from "react";
import Layout from "./Layout";
import {
  ChevronLeft,
  Headphones,
  Mic,
  Octagon,
  Pause,
  PauseCircle,
  Play,
  X,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
const SongDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const lineRef = useRef([]);
  const ulRef = useRef(null);
  const [selectedSong, setSelectedSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(null);
  const [chordChartsDisplayed, setChordChartsDisplayed] = useState(false);
  const speedList = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const lines = selectedSong ? JSON.parse(selectedSong.lyrics_chords) : [];
  useEffect(() => {
    if (scrollSpeed === null) return;
    scrollTo(ulRef.current, ulRef.current.scrollHeight, 5000, 1000);
  }, [scrollSpeed]);
  useEffect(() => {
    setSelectedSong(location.state.selectedSong);
  }, [location]);
  function scrollTo(element, to, duration, lastDifference) {
    var difference = to - element.scrollTop;
    var perTick = (difference / duration) * 10;
    if (duration <= 0 || lastDifference === difference) {
      setScrollSpeed(0);
      return false;
    }
    setTimeout(function () {
      element.scrollTop = element.scrollTop + perTick;
      scrollTo(element, to, duration - 10, difference);
      console.log(scrollSpeed);
    }, 80 / scrollSpeed);
  }
  const playRecording = async () => {
    const base64Response = await fetch(
      `data:image/jpeg;base64,${selectedSong.recording}`
    );
    const blob = await base64Response.blob();

    let context = new AudioContext();
    let fileReader = new FileReader();
    let arrayBuffer;

    fileReader.onloadend = () => {
      arrayBuffer = fileReader.result;
      context.decodeAudioData(arrayBuffer, (audioBuffer) => {
        play(audioBuffer);
        setIsPlaying(true);
      });
    };
    fileReader.readAsArrayBuffer(blob);
    function play(audioBuffer) {
      audioRef.current = null;
      audioRef.current = new AudioBufferSourceNode(context, {
        buffer: audioBuffer,
      });
      audioRef.current.connect(context.destination);
      audioRef.current.loop = true;
      audioRef.current.start();
    }
  };
  function pauseRecording() {
    if (audioRef.current) {
      audioRef.current.stop();
      setIsPlaying(false);
    }
  }
  const chords = selectedSong?.chords?.split(",");
  console.log(chords);
  return (
    <Layout>
      <div className="home">
        <div className="details">
          <div className="lyrics">
            <div
              className="header"
              onClick={() => {
                navigate(-1);
              }}
            >
              <ChevronLeft size={32} />
              <h3>{selectedSong?.title}</h3>
            </div>
            <ul id="song-line-items" ref={ulRef}>
              <li>&nbsp;</li>
              <li>&nbsp;</li>
              <li>&nbsp;</li>
              <li>&nbsp;</li>
              <li>&nbsp;</li>
              <li>&nbsp;</li>
              <li>&nbsp;</li>
              <li>&nbsp;</li>
              {lines?.map((item, index) => (
                <li
                  key={item.id}
                  ref={(el) => {
                    lineRef.current[index] = el;
                  }}
                >
                  {item.text}
                </li>
              ))}
              <li>&nbsp;</li>
              <li>&nbsp;</li>
            </ul>
          </div>
          <div className="controls">
            <div className="flex-box">
              <div className="label">Capo</div>
              <div className="value">{selectedSong?.capo}</div>
            </div>
            <div className="flex-box">
              <div className="label">Strum</div>
              <div className="value">{selectedSong?.strum}</div>
            </div>

            {selectedSong?.recording ? (
              <div className="flex-box">
                <div className="label">Recording</div>
                <div className="value" id="btn">
                  <button
                    className="customBtn"
                    onClick={() => {
                      if (!isPlaying) playRecording();
                      else pauseRecording();
                    }}
                  >
                    {!isPlaying ? (
                      <Play color="#fff" />
                    ) : (
                      <PauseCircle color="#fff" />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <></>
            )}
            <div className="flex-box">
              <div className="label">Scroll</div>
              <div className="value">{scrollSpeed}</div>
            </div>
            <ul>
              {speedList.map((item, index) => (
                <li
                  key={index}
                  onClick={() => {
                    setScrollSpeed(item);
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex-box mb-0">
              <div className="label">Chord Chart</div>
              <div
                className="value toggle-switch"
                onClick={() => {
                  setChordChartsDisplayed((prevState) => !prevState);
                }}
              >
                {chordChartsDisplayed ? "HIDE" : "SHOW"}
              </div>
            </div>
            <div
              className="flex-box chord-list"
              style={{ display: chordChartsDisplayed ? "flex" : "none" }}
            >
              {chords?.map((item, index) => (
                <div className="chord-wrapper" key={index}>
                  <h6>{item}</h6>
                  <img src={`/images/chords/${item}.png`} />
                </div>
              ))}
            </div>
            {chordChartsDisplayed && (
              <p style={{ fontSize: "0.8em", textAlign: "right" }}>
                Shift + Scroll to move through the list
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SongDetails;
