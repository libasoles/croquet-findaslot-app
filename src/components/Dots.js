import { range } from "../utils";

export default function Dots({ calendarService, identity, timeSlot }) {
const usersList = calendarService
    .usersWhoSelectedSlot(timeSlot);

  const names = usersList
    .map((userId) => identity.name(userId))
    .join(", ");

  return createDotElements(usersList.length, names);
}

function createDotElements(count, tooltipText) {
  return count > 0 ? (
    <div className="dots">
      <Tooltip text={tooltipText} />
      <>
        {range(count).map((i) => (
          <Dot />
        ))}
      </>
    </div>
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
