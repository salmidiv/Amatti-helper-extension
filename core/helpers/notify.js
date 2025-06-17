import { _ } from "./helpers.js";

class Notify {
  toast = (obj, time = 2.5) => {
    //  t, c = 'dark', e
    var tNotif = _.qSel(".notify");
    if (tNotif != null) {
      tNotif.innerHTML = `<span style="--timer: ${time}s" class="btn-${
        obj.color ?? "dark"
      }"><i class="${obj.type}"></i>${obj.message}</span>`;
    }
  };
  note(notifyID, text) {
    notifyID.innerHTML += `<div class="note hacen d-flex p-2 fs-2 w-100 mb-2">
                    <div class="pr-6">${text}</div>
                </div>`;
  }
  warning_note(notifyID, text) {
    notifyID.innerHTML += `<div class="note hacen wr d-flex p-2 fs-2 w-100 mb-2">
                    <div class="pr-6">${text}</div>
                </div>`;
  }
  loader(id, type) {
    const tag = typeof id === "object" ? id : _.qSel(id);
    const message = type == 1 ? '<div class="lds-dual-ring"></div>' : "";
    _.html(tag, message);
  }
}
const notify = new Notify();
export { notify };
