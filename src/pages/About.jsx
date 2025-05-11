import React from "react";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white pt-26 px-6 md:px-12 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-cyan-300">
          About CoinPulseX
        </h1>

        <p className="text-lg sm:text-xl text-gray-300 mb-6">
          CoinPulseX is a mock crypto trading platform created to simulate
          real-world trading using a virtual currency called{" "}
          <span className="font-semibold">CCoin</span> (1 CCoin = 1 USD). It’s
          an educational tool that helps users understand trading mechanics
          without any financial risk.
        </p>

        <div className="bg-gray-900 p-6 rounded-xl shadow-lg mb-8">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-3 text-cyan-300">
            Key Features
          </h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Live price updates from Binance API</li>
            <li>Buy/Sell crypto using CCoins</li>
            <li>Real-time portfolio value tracking</li>
            <li>Full trade history</li>
            <li>Clean, dark-themed UI</li>
          </ul>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl shadow-lg mb-8">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-3 text-cyan-300">
            My Vision
          </h2>
          <p className="text-gray-400">
            I've always been passionate about crypto and stock markets. I wanted
            a safe, realistic space to experiment, learn, and grow — so I built
            CoinPulseX as a personal learning platform. It’s evolved into a
            full-featured simulator that reflects real-time market behavior, and
            I hope it helps others too.
          </p>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl shadow-lg mb-8">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-3 text-cyan-300">
            Tech Stack
          </h2>
          <p className="text-gray-400">
            This project was built using{" "}
            <span className="text-white font-medium">ReactJS</span>,{" "}
            <span className="text-white font-medium">Firebase</span>, and the{" "}
            <span className="text-white font-medium">Binance API</span> to bring
            real-time data into a clean, educational platform. Hope you enjoy
            using CoinPulseX!
          </p>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl shadow-lg mb-8">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-3 text-cyan-300">
            About the Developer
          </h2>
          <p className="text-gray-300 mb-2">
            Hi! I’m <span className="font-semibold text-white">Het</span>, a
            developer who loves building interactive projects and diving into
            the world of finance, crypto, and web technologies.
          </p>
          <p className="text-gray-400">
            Feel free to connect with me or explore more of my work:
          </p>

          <ul className="mt-4 space-y-2 text-cyan-300">
            <li>
              📧 Email:{" "}
              <a href="mailto:hetsalot1410@gmail.com" className="underline">
                hetsalot1410@gmail.com
              </a>
            </li>
            <li>
              🐙 GitHub:{" "}
              <a
                href="https://github.com/hetsalot"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                github.com/hetsalot
              </a>
            </li>
            <li>
              💼 LinkedIn:{" "}
              <a
                href="https://linkedin.com/in/het-salot-8a20a5330"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                linkedin.com/in/hetsalot
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default About;
