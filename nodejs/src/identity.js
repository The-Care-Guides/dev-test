// Stand-in for authentication. Wiring real sessions or tokens is out of scope for
// the exercise, so each client asserts who it is with a header and we take that at
// face value. Replacing this file is the only change real auth would require.

const CUSTOMER_HEADER = 'X-Customer-Email';
const STAFF_HEADER = 'X-Staff-Id';

// Attaches whatever identity the caller claims, and nothing if it claims none.
// Anonymous requests are passed through rather than rejected — which routes need
// which principal is a per-route decision.
function identity(req, res, next) {
  const email = req.get(CUSTOMER_HEADER);
  const staffId = req.get(STAFF_HEADER);

  req.customer = email ? { email } : null;
  req.staff = staffId ? { id: staffId } : null;

  next();
}

module.exports = { identity, CUSTOMER_HEADER, STAFF_HEADER };
