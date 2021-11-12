import { range } from "../utils";

export default function createDotElements(count, tooltipText) {
  return count > 0 ? (
    <>
      <Tooltip text={tooltipText} />
      <>
        {range(count).map((i) => (
          <Dot />
        ))}
      </>
    </>
  ) : null;
}

function Tooltip({ text }) {
  if (!text) return <></>;

  return (
    <div className="tooltip">
      <div className="content">{text}</div>
    </div>
  );
}

function Dot() {
  return <div className="dot"></div>;
}
