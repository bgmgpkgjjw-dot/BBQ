/* ==========================================================
   Hermanos Grill Companion
   dialogs.js — themed replacements for prompt / confirm / alert,
   and a lock against accidental pinch / double-tap zoom.

   Dialogs live outside #app so render() never wipes them.
========================================================== */

function openDialog({ title, message = "", input = null, confirmText = "OK", cancelText = "Cancel", danger = false }) {
    return new Promise(resolve => {
        const overlay = document.createElement("div");
        overlay.className = "dialog-overlay";

        const dialog = document.createElement("div");
        dialog.className = "dialog";
        dialog.setAttribute("role", "dialog");
        dialog.setAttribute("aria-modal", "true");

        const heading = document.createElement("h3");
        heading.className = "dialog-title";
        heading.textContent = title;
        dialog.appendChild(heading);

        if (message) {
            const text = document.createElement("p");
            text.className = "dialog-message";
            text.textContent = message;
            dialog.appendChild(text);
        }

        let field = null;
        if (input) {
            field = document.createElement("input");
            field.type = "text";
            field.className = "dialog-input";
            field.value = input.value || "";
            field.placeholder = input.placeholder || "";
            field.maxLength = input.maxLength || 80;
            dialog.appendChild(field);
        }

        const actions = document.createElement("div");
        actions.className = "dialog-actions";

        const cancel = document.createElement("button");
        cancel.type = "button";
        cancel.className = "btn btn-ghost";
        cancel.textContent = cancelText;

        const confirm = document.createElement("button");
        confirm.type = "button";
        confirm.className = `btn ${danger ? "btn-danger" : "btn-primary"}`;
        confirm.textContent = confirmText;

        if (cancelText) actions.appendChild(cancel);
        actions.appendChild(confirm);
        dialog.appendChild(actions);
        overlay.appendChild(dialog);

        const previousFocus = document.activeElement;

        function close(result) {
            document.removeEventListener("keydown", onKey);
            overlay.classList.remove("show");
            setTimeout(() => overlay.remove(), 150);
            if (previousFocus && previousFocus.focus) previousFocus.blur();
            resolve(result);
        }

        function submit() {
            if (field) {
                const value = field.value.trim();
                if (!value) return;
                close(value);
            } else {
                close(true);
            }
        }

        function onKey(event) {
            if (event.key === "Escape") close(field ? null : false);
            if (event.key === "Enter" && field) submit();
        }

        cancel.addEventListener("click", () => close(field ? null : false));
        confirm.addEventListener("click", submit);
        overlay.addEventListener("pointerdown", event => {
            if (event.target === overlay && cancelText) close(field ? null : false);
        });
        document.addEventListener("keydown", onKey);

        document.body.appendChild(overlay);
        requestAnimationFrame(() => {
            overlay.classList.add("show");
            if (field) {
                field.focus();
                field.select();
            } else {
                confirm.focus();
            }
        });
    });
}

// Resolves to the entered text, or null when cancelled.
function uiPrompt(title, value = "", options = {}) {
    return openDialog({
        title,
        input: { value, placeholder: options.placeholder, maxLength: options.maxLength },
        confirmText: options.confirmText || "Save"
    });
}

// Resolves to true / false.
function uiConfirm(title, message, options = {}) {
    return openDialog({
        title,
        message,
        confirmText: options.confirmText || "Confirm",
        danger: options.danger === true
    });
}

function uiAlert(title, message) {
    return openDialog({ title, message, confirmText: "OK", cancelText: "" });
}

// iOS Safari ignores user-scalable=no, so block the pinch gesture itself.
["gesturestart", "gesturechange", "gestureend"].forEach(name => {
    document.addEventListener(name, event => event.preventDefault());
});

window.uiPrompt = uiPrompt;
window.uiConfirm = uiConfirm;
window.uiAlert = uiAlert;
