const generateOTP = require("./src/utils/generateOTP");
const resetToken = require("./src/utils/generateResetToken");

console.log("OTP Generated:",generateOTP());
console.log("Reset Token:",resetToken());