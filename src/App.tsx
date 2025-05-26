import "@dotlottie/player-component";
import {
  KeyboardEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Joyride, { ACTIONS, CallBackProps } from "react-joyride";
import "./App.css";
import { Cake } from "./components/Cake";
import { CakeActions } from "./components/CakeActions";
import { Name } from "./components/Name";
import { Footer } from "./components/Footer/Footer";

// const version = import.meta.env.PACKAGE_VERSION;

const src = new URL("/assets/hbd2.mp3", import.meta.url).href;

const steps = [
  {
    target: "#name",
    content: "Đây là ô nhập tên.",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: "#candle",
    content: "Thổi vào cổng Lightning để thổi tắt nến.",
    placement: "bottom",
  },
  {
    target: "#start",
    content: "Nhấn start để phát nhạc và thắp nến.",
    placement: "top",
  },
  {
    target: "#pause",
    content: "Nhấn pause nếu bạn muốn tạm dừng nhạc.",
    placement: "top",
  },
  {
    target: "#stop",
    content: "Nhấn stop nếu bạn muốn hủy tạm thời.",
    placement: "top",
  },
  {
    target: "#toggle-candle",
    content: "Nhấn nút nếu bạn muốn thắp hoặc thổi tắt nến.",
    placement: "top",
  },
  {
    target: "#share",
    content: "Thay đổi tên và nhấp vào 'Share' để gửi món quà cho bất kỳ ai.",
    placement: "top",
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
] as any;

const sharedSteps = [
  {
    target: "#start",
    content: "Click here",
    placement: "top",
    disableBeacon: true,
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
] as any;

function App() {
  const [candleVisible, setCandleVisible] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(new Audio(src));
  const microphoneStreamRef = useRef<MediaStream | undefined>(undefined);

  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [run, setRun] = useState(true);
  const [shareMode, setShareMode] = useState(false);

  const [name, setName] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  const visibility = shareMode || playing;

  const lightCandle = useCallback(() => setCandleVisible(true), []);

  const turnOffTheCandle = useCallback(() => setCandleVisible(false), []);

  const toggleLightCandle = useCallback(
    () => setCandleVisible((prevState) => !prevState),
    []
  );

  const startAudio = useCallback(() => {
    setPlaying(true);
    audioRef.current.load();
    audioRef.current.play();
    setPaused(false);
  }, []);

  const pause = useCallback(() => {
    audioRef.current.pause();
    setPaused(true);
  }, []);

  const stopAudio = useCallback(() => {
    setPlaying(false);
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setPaused(false);
  }, []);

  const start = useCallback(() => {
    startAudio();
    lightCandle();
  }, [lightCandle, startAudio]);

  const stop = useCallback(() => {
    stopAudio();
    turnOffTheCandle();
    setTimeout(() => {
      nameRef.current ? nameRef.current.focus() : undefined;
    }, 0);
  }, [stopAudio, turnOffTheCandle]);

  const blowCandles = useCallback(async (stream: MediaStream) => {
    try {
      microphoneStreamRef.current = stream;

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);
      analyser.fftSize = 2048;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const detectBlow = () => {
        analyser.getByteFrequencyData(dataArray);
        const average =
          dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
        const threshold = 43;

        if (average > threshold) {
          setCandleVisible(false);
        }
      };

      setInterval(detectBlow, 100);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  }, []);

  const handleJoyrideCallback = useCallback(
    (data: CallBackProps) => {
      const { action } = data;
      if (action === ACTIONS.RESET || action === ACTIONS.CLOSE) {
        // do something
        setRun(false);
        setTimeout(() => {
          nameRef.current ? nameRef.current.focus() : undefined;
        }, 0);
      }
    },
    [setRun]
  );

  const onEnded = useCallback(() => {}, []);

  const onKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setTimeout(() => {
        nameRef.current ? nameRef.current.blur() : undefined;
      }, 0);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        if (stream) {
          blowCandles(stream);
        }
      } catch (error) {
        console.error("Error accessing microphone:", error);
      }
    })();

    return () => {
      if (microphoneStreamRef.current) {
        microphoneStreamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, [blowCandles]);

  useLayoutEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const sharedParam = urlParams.get("shared");
    if (sharedParam) {
      setCandleVisible(true);
      setShareMode(true);
    }
  }, []);

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Joyride
          styles={{
            options: {
              zIndex: shareMode ? 10000 : -10000,
            },
            buttonSkip: {
              outline: 0,
            },
            buttonNext: {
              outline: 0,
            },
            buttonBack: {
              outline: 0,
            },
            buttonClose: {
              outline: 0,
            },
          }}
          steps={sharedSteps}
          run={run}
          showSkipButton
          continuous
          callback={handleJoyrideCallback}
          hideBackButton
          hideCloseButton
          showProgress
          spotlightClicks
        />
        <Joyride
          styles={{
            options: {
              zIndex: !shareMode ? 10000 : -10000,
            },
            buttonSkip: {
              outline: 0,
            },
            buttonNext: {
              outline: 0,
            },
            buttonBack: {
              outline: 0,
            },
            buttonClose: {
              outline: 0,
            },
          }}
          steps={steps}
          run={run}
          showSkipButton
          continuous
          callback={handleJoyrideCallback}
          hideBackButton
          hideCloseButton
          showProgress
          spotlightClicks
        />

        <audio {...{ src, ref: audioRef, preload: "auto", onEnded }} />

        <div>
          <Name
            {...{
              ref: nameRef,
              name,
              setName,
              shareMode,
              playing,
              run,
              onKeyPress,
            }}
          />
          <Cake {...{ candleVisible }} />
        </div>

        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <dotlottie-player
            src="/assets/test.lottie"
            autoplay
            loop
            style={{
              zIndex: 20,
              visibility: visibility ? "visible" : "hidden",
              width: 400,
            }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            top: "25%",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <dotlottie-player
            src="/assets/confetti.lottie"
            autoplay
            loop
            style={{
              zIndex: 30,
              visibility: visibility ? "visible" : "hidden",
              width: 400,
            }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "1.25%",
            left: "50%",
            transform: "translateX(-50%)",
            marginBottom: "3.5rem",
          }}
        >
          <CakeActions
            {...{
              run,
              start,
              pause,
              stop,
              toggleLightCandle,
              setRun,
              playing,
              paused,
              candleVisible,
            }}
          />
        </div>
      </div>
      <Footer />
    </>
  );
}

export default App;
