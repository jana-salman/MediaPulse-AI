import React from "react";
import Svg, { Polyline } from "react-native-svg";

/**
 * The one signature element of MediaPulse AI: a heartbeat/audio-waveform
 * line, standing in literally for "listening to the pulse of your
 * customers." Used under headers and in empty states -- nowhere else,
 * so it stays a signature rather than a texture.
 */
export function PulseWaveform({
  color,
  width = 160,
  height = 28,
}: {
  color: string;
  width?: number;
  height?: number;
}) {
  const midY = height / 2;
  const points = [
    [0, midY],
    [width * 0.16, midY],
    [width * 0.24, midY - height * 0.15],
    [width * 0.32, midY],
    [width * 0.4, midY],
    [width * 0.46, midY - height * 0.85],
    [width * 0.5, midY + height * 0.7],
    [width * 0.56, midY],
    [width * 0.64, midY],
    [width * 0.72, midY - height * 0.15],
    [width * 0.8, midY],
    [width, midY],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(" ");

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
