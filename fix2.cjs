const fs = require('fs');
let code = fs.readFileSync('src/components/AuthKycModal.tsx', 'utf8');

const target = `                  <span>Register Credentials & Verify Identity</span>
                )}
              </button>
            </form>
          )}`;

const replace = `                  <span>Register Credentials & Verify Identity</span>
                )}
              </button>
            </form>
              )}
            </div>
          )}`;

if (code.includes(target)) {
  code = code.replace(target, replace);
  fs.writeFileSync('src/components/AuthKycModal.tsx', code);
  console.log("Fixed!");
} else {
  console.log("Target not found!");
}
