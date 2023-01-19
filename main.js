const calculator = document.querySelector("#calculator");
const answer = document.querySelector("#answer");
const nisText = document.querySelector("#nis");
const healthSurchargeText = document.querySelector("#healthsurcharge");
const payeText = document.querySelector("#paye");
const copyButton = document.querySelector("#copybtn");
let periodStart;
let periodEnd;

$(function () {
  $('input[name="daterange"]').daterangepicker({
    autoUpdateInput: false,
    autoApply: true,
    ranges: {
      "This Month": [moment().startOf("month"), moment().endOf("month")],
      "Last Month": [
        moment().subtract(1, "month").startOf("month"),
        moment().subtract(1, "month").endOf("month"),
      ],
    },
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
  let paye;
  if (grossPay < 7500.01) {
    netPay = grossPay - (healthSurcharge + nis) * numberMondays;
  } else {
    paye = calculate_paye(grossPay, nis);
    netPay = grossPay - ((healthSurcharge + nis) * numberMondays + paye);
  }
  answer.textContent = formatNumber(netPay);
  nisText.textContent = nis ? formatNumber(nis * numberMondays) : "0.00";
  healthSurchargeText.textContent = healthSurcharge
    ? formatNumber(healthSurcharge * numberMondays)
    : "0.00";
  payeText.textContent = paye ? formatNumber(paye) : "0.00";
  document.querySelector("#resultscontainer").style.display = "block";
});

copyButton.addEventListener("click", () => {
  navigator.clipboard.writeText(answer.textContent);
  copyButton.textContent = "Copied!";
  setTimeout(() => {
    copyButton.textContent = "Copy";
  }, 1000);
});

function calculate_paye(pay, contributions) {
  const currentYear = new Date().getFullYear();
  const yearStart = new Date(`${currentYear}-01-01 00:00:00`);
  const yearEnd = new Date(`${currentYear}-12-31 00:00:00`);
  const taxExemptionLimit = 90000;
  const pensionDeductions = 0;
  const annualIncome = pay * 12;
  const totalMondays = countCertainDays([1], yearStart, yearEnd);
  const nisDeduction = contributions * totalMondays * 0.7;
  const nonchargeableIncome =
    taxExemptionLimit + nisDeduction + pensionDeductions;
  const taxableIncome = annualIncome - nonchargeableIncome;
  return (taxableIncome * 0.25) / 12;
}
