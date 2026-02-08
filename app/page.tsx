"use client";

import { useMemo, useState } from "react";
import raw from "@/src/data/questions.json";
import { shuffle } from "@/src/lib/shuffle";

type Choice = { id: string; text: string };
type Q = {
  id: number;
  question: string;
  choices: Choice[];
  answer: string;
  explanation?: string;
  images?: string[];
};

const questions = raw as Q[];

function clsx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function Page() {
  const randomized = useMemo(() => shuffle(questions), []);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showImg, setShowImg] = useState(true);

  const q = randomized[idx];
  const isRevealed = selected !== null;
  const correct = q.answer;

  function pick(choiceId: string) {
    if (isRevealed) return;
    setSelected(choiceId);
  }

  function next() {
    setSelected(null);
    setIdx((v) => (v + 1 < randomized.length ? v + 1 : v));
  }

  function restart() {
    // simplest: reload to re-randomize order
    window.location.reload();
  }

  const progress = `${idx + 1} / ${randomized.length}`;

  return (
    <main style={{ minHeight: "100vh", background: "#0b0f19", color: "#e6e8ee" }}>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: 20 }}>
        <header style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>Databricks Certified Data Engineer Professional — Quiz</div>
            <div style={{ opacity: 0.8, marginTop: 4, fontSize: 13 }}>Random order every load • Reveal happens immediately after you click</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ fontVariantNumeric: "tabular-nums", opacity: 0.85 }}>{progress}</div>
            <button onClick={restart} style={btnStyle("secondary")}>Restart (new shuffle)</button>
          </div>
        </header>

        <section style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ fontSize: 14, opacity: 0.8 }}>Question #{q.id}</div>
            {q.images?.length ? (
              <button onClick={() => setShowImg((v) => !v)} style={btnStyle("ghost")}>
                {showImg ? "Hide image" : "Show image"}
              </button>
            ) : null}
          </div>

          <div style={{ marginTop: 10, fontSize: 18, lineHeight: 1.45, whiteSpace: "pre-wrap" }}>
            {q.question}
          </div>

          {showImg && q.images?.length ? (
            <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
              {q.images.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={src}
                  alt={`Question ${q.id} image`}
                  style={{ width: "100%", height: "auto", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)" }}
                />
              ))}
            </div>
          ) : null}

          <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
            {q.choices.map((c) => {
              const isCorrect = c.id === correct;
              const isSelected = c.id === selected;

              const base = "choice";
              const state =
                !isRevealed
                  ? "idle"
                  : isCorrect
                  ? "correct"
                  : isSelected
                  ? "wrong"
                  : "dim";

              return (
                <button
                  key={c.id}
                  onClick={() => pick(c.id)}
                  className={clsx(base, state)}
                  style={choiceStyle(state)}
                >
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, display: "grid", placeItems: "center", fontWeight: 700, background: "rgba(255,255,255,0.08)" }}>
                      {c.id}
                    </div>
                    <div style={{ textAlign: "left", lineHeight: 1.35 }}>
                      {c.text}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {isRevealed ? (
            <div style={{ marginTop: 16, padding: 14, borderRadius: 14, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
              <div style={{ fontWeight: 700 }}>
                Correct answer: {correct}
              </div>
              <div style={{ marginTop: 6, opacity: 0.9, lineHeight: 1.45 }}>
                {q.explanation?.trim()
                  ? q.explanation
                  : "No explanation is provided in the source PDF for this item."}
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  onClick={next}
                  disabled={idx + 1 >= randomized.length}
                  style={btnStyle("primary", idx + 1 >= randomized.length)}
                >
                  Next
                </button>
                <div style={{ opacity: 0.75, alignSelf: "center", fontSize: 13 }}>
                  (Answer & explanation reveal immediately after selection)
                </div>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 14, opacity: 0.75, fontSize: 13 }}>
              Click a choice to reveal the correct answer and explanation.
            </div>
          )}
        </section>

        <footer style={{ marginTop: 16, opacity: 0.65, fontSize: 12, lineHeight: 1.4 }}>
          Source: user-provided PDF. This app is front-end only and stores no data.
        </footer>
      </div>
    </main>
  );
}

function btnStyle(kind: "primary" | "secondary" | "ghost", disabled?: boolean) {
  const common: React.CSSProperties = {
    borderRadius: 12,
    padding: "10px 12px",
    fontWeight: 650,
    border: "1px solid rgba(255,255,255,0.14)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    background: "rgba(255,255,255,0.06)",
    color: "#e6e8ee",
  };
  if (kind === "primary") {
    return { ...common, background: "rgba(99,102,241,0.25)", border: "1px solid rgba(99,102,241,0.45)" };
  }
  if (kind === "secondary") {
    return { ...common, background: "rgba(255,255,255,0.06)" };
  }
  return { ...common, background: "transparent" };
}

const cardStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 18,
  borderRadius: 18,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.10)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
};

function choiceStyle(state: "idle" | "correct" | "wrong" | "dim") {
  const common: React.CSSProperties = {
    width: "100%",
    textAlign: "left",
    borderRadius: 14,
    padding: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.03)",
    color: "#e6e8ee",
    cursor: "pointer",
  };

  if (state === "correct") return { ...common, border: "1px solid rgba(34,197,94,0.55)", background: "rgba(34,197,94,0.12)" };
  if (state === "wrong") return { ...common, border: "1px solid rgba(239,68,68,0.55)", background: "rgba(239,68,68,0.10)" };
  if (state === "dim") return { ...common, opacity: 0.55, cursor: "default" };
  return common;
}
