import "./App.css";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import copy from "copy-to-clipboard";
import { useState, useEffect, useRef } from "react";
import nlp from 'compromise';
import { parse } from 'chrono-node';

const App = () => {
    const [textToCopy, setTextToCopy] = useState("");
    const [isCopied, setIsCopied] = useState(false);
    const [extractedData, setExtractedData] = useState({
        dates: [],
        discussionPoints: []
    });
    const textRef = useRef(null);

    const handleCopy = () => {
        copy(textToCopy);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 1000);
    };

    const startListening = () => SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
    const { transcript, browserSupportsSpeechRecognition } = useSpeechRecognition();

    useEffect(() => {
        if (transcript) {
            setTextToCopy(transcript);
        }
    }, [transcript]);

    useEffect(() => {
        if (textToCopy) {
            const doc = nlp(textToCopy);
            
            const discussionPoints = doc.sentences().out('array')
                .map(sentence => sentence.trim())
                .filter(sentence => sentence.length > 5);
            
            const dateResults = parse(textToCopy, { forwardDate: true });
            const formattedDates = dateResults.length > 0 
                ? dateResults.map(d => d.start.date().toString()) 
                : ["No valid date found"];

            setExtractedData({ dates: formattedDates, discussionPoints });
        }
    }, [textToCopy]);

    const handleTextChange = () => {
        if (textRef.current) {
            setTextToCopy(textRef.current.innerText);
        }
    };

    if (!browserSupportsSpeechRecognition) {
        return null;
    }

    return (
        <>
            <div className="container">
                <h2>Voice Assistant</h2>
                <p>A prototype React Assistant developed by Danish Alam.</p>
                
                <div 
                    className="main-content" 
                    contentEditable 
                    suppressContentEditableWarning 
                    ref={textRef} 
                    onInput={handleTextChange}
                >
                    {textToCopy || "Start speaking..."}
                </div>
                
                <div className="btn-style">
                    <button onClick={handleCopy}>{isCopied ? 'Copied!' : 'Copy to clipboard'}</button>
                    <button onClick={startListening}>Start Listening</button>
                    <button onClick={SpeechRecognition.stopListening}>Stop Listening</button>
                </div>
                
                <div className="extracted-info">
                    <h3>Extracted Information:</h3>
                    <div className="info-box">
                        <h4>Meeting Dates:</h4>
                        <ul>
                            {extractedData.dates.length > 0 ? extractedData.dates.map((date, index) => <li key={index}>{date}</li>) : <li>No dates found</li>}
                        </ul>
                    </div>
                    <div className="info-box">
                        <h4>Discussion Points:</h4>
                        <ul>
                            {extractedData.discussionPoints.length > 0 ? extractedData.discussionPoints.map((point, index) => <li key={index}>{point}</li>) : <li>No discussion points found</li>}
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
};

export default App;
