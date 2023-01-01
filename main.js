const calculator = document.querySelector("#calculator");
const answer = document.querySelector("#answer");
const copyButton = document.querySelector("#copybtn");
let periodStart;
let periodEnd;

$(function () {
  $('input[name="daterange"]').daterangepicker({
    autoUpdateInput: false,
    locale: {
      cancelLabel: "Clear",
    },
  });

  $('input[name="daterange"]').on(
    "apply.daterangepicker",
    function (ev, picker) {
      $(this).val(
        picker.startDate.format("DD/MM/YYYY") +
          " - " +
          picker.endDate.format("DD/MM/YYYY")
      );
      periodStart = new Date(picker.startDate.format("YYYY/MM/DD"));
      periodEnd = new Date(picker.endDate.format("YYYY/MM/DD"));
    }
  );

  $('input[name="daterange"]').on(
    "cancel.daterangepicker",
    function (ev, picker) {
      $(this).val("");
    }
  );
});

// https://stackoverflow.com/questions/25562173/calculate-number-of-specific-weekdays-between-dates
// days is an array of weekdays: 0 is Sunday, ..., 6 is Saturday
function countCertainDays(days, d0, d1) {
  var ndays = 1 + Math.round((d1 - d0) / (24 * 3600 * 1000));
  var sum = function (a, b) {
    return a + Math.floor((ndays + ((d0.getDay() + 6 - b) % 7)) / 7);
  };
  return days.reduce(sum, 0);
}

const formatNumber = (numToFormat) => {
  return Number(numToFormat)
    .toFixed(2)
    .split(".")
    .map((num, idx) =>
      idx === 0 ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : num
    )
    .join(".");
};

calculator.addEventListener("submit", (e) => {
  e.preventDefault();
  const grossPay = Number(document.querySelector("#grosspay").value);
  const numberMondays = countCertainDays([1], periodStart, periodEnd);
  const healthSurcharge = grossPay < 470 ? 4.8 : 8.25;
  const nis =
    grossPay < 867
      ? 0
      : grossPay < 1473
      ? 11.9
      : grossPay < 1950
      ? 17.4
      : grossPay < 2643
      ? 23.3
      : grossPay < 3293
      ? 30.1
      : grossPay < 4030
      ? 37.2
      : grossPay < 4853
      ? 45.1
      : grossPay < 5633
      ? 53.2
      : grossPay < 6457
      ? 61.4
      : grossPay < 7410
      ? 70.4
      : grossPay < 8277
      ? 79.6
      : grossPay < 9273
      ? 89.1
      : grossPay < 10313
      ? 99.4
      : grossPay < 11397
      ? 110.2
      : grossPay < 12653
      ? 122.1
      : grossPay < 13600
      ? 133.3
      : 138.1;
  let netPay;
  if (grossPay < 7500.01) {
    netPay = grossPay - (healthSurcharge + nis) * numberMondays;
    console.log(netPay);
    answer.textContent = formatNumber(netPay);
    document.querySelector("#resultscontainer").style.display = "block";
  } else {
    console.log("need to deduct taxes");
  }
});

copyButton.addEventListener("click", () => {
  navigator.clipboard.writeText(answer.textContent);
  copyButton.textContent = "Copied!";
  setTimeout(() => {
    copyButton.textContent = "Copy";
  }, 1000);
});
