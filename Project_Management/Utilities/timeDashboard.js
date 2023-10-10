const getMonthAndYear = {
  $addFields: {
    month: { $month: "$cDate" },
    year: { $year: "$cDate" },
  },
};

const getLatestReview = {
  $addFields: {
    reviewData: { $arrayElemAt: ["$folderFiles.tasks", -1] },
  },
};
const getLatestReviewFor = {
  $addFields: {
    reviewData: { $arrayElemAt: ["$reviewData", -1] },
  },
};
const convertToDateStage = {
  $addFields: {
    convertedTatDate: {
      $toDate: "$tat",
    },
    closedOn: {
      $cond: [
        {
          $ifNull: ["$folderFiles.closedOn", false],
        },
        "$folderFiles.closedOn",
        1,
      ],
    },
  },
};

const convertToDateClosedOn = {
  $addFields: {
    convertedClosedOn: {
      $toDate: "$reviewData.closedOn",
    },
  },
};
const convertToDateProjectClosedOn = {
  $addFields: {
    convertedProjectClosedOn: {
      $toDate: "$closedOn",
    },
  },
};

const compareProjectDates = {
  $addFields: {
    dateIn: {
      $lte: ["$convertedProjectClosedOn", "$convertedTatDate"],
    },
    dateOut: {
      $gt: ["$convertedProjectClosedOn", "$convertedTatDate"],
    },
  },
};

const compareDates = {
  $addFields: {
    dateIn: {
      $lte: ["$convertedClosedOn", "$convertedTatDate"],
    },
    dateOut: {
      $gt: ["$convertedClosedOn", "$convertedTatDate"],
    },
  },
};

const getDateCount = {
  $facet: {
    inTime: [
      {
        $match: {
          dateIn: true,
        },
      },
      { $count: "in24Time" },
    ],

    outTime: [
      {
        $match: {
          dateOut: true,
        },
      },
      { $count: "out24Time" },
    ],

    totalTime: [
      {
        $count: "count",
      },
    ],
  },
};

module.exports = {
    getMonthAndYear,
    getLatestReview,
    getLatestReviewFor,
    convertToDateStage,
    convertToDateClosedOn,
    convertToDateProjectClosedOn,
    compareProjectDates,
    compareDates,
    getDateCount
  };