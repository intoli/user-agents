(
 ; Set the JavaScript checkers.
 ; Run `flycheck-verify-setup` to see the current status.
 (js-mode . ((flycheck-checker . javascript-eslint)
                 (flycheck-disabled-checkers . (lsp javascript-jshint javascript-standard))))
)
