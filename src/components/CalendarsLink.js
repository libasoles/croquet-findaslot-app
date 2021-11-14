import i18next from "i18next";

export function scheduleLinks(eventName, start, end, messageKey = "schedule") {
  const simplifiedStart = simplifiedDateFormat(start);
  const simplifiedEnd = simplifiedDateFormat(end);

  const googleCalendar = `http://www.google.com/calendar/event?action=TEMPLATE&dates=${simplifiedStart}%2F${simplifiedEnd}&text=${eventName}&location=&details=`;
  const outlookCalendar = `https://outlook.office.com/calendar/0/deeplink/compose?body=${eventName}%29&location=&path=%2Fcalendar%2Faction%2Fcompose&rru=addevent&startdt=${start}&enddt=${end}&subject=${eventName}`;

  return (
    <div className="calendars">
      <div className="title">{i18next.t(messageKey)}</div>
      <a href={googleCalendar}>Google</a>
      <a href={outlookCalendar}>Outlook</a>
    </div>
  );
}

function simplifiedDateFormat(isoDate) {
  return isoDate.replaceAll("-", "");
}
