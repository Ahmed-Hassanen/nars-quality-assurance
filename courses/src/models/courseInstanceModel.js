const mongoose = require("mongoose");

const courseInstanceSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.ObjectId,
    ref: "course",
  },
  courseSpecsPath: String,
  courseReportPath: String,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  approved: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: true,
  },
  reportCompleted: {
    type: Boolean,
    default: false,
  },
  courseSpecsCompleted: {
    type: Boolean,
    default: false,
  },
  marks: {
    type: [
      {
        studentId: {
          type: String,
          required: [true, "you should specify student id"],
        },
        mark: {
          type: Number,
          required: [true, "you should specify student mark"],
        },
      },
    ],
  },
  exams: [mongoose.Schema.ObjectId],
  students: [mongoose.Schema.ObjectId],
  assignments: [mongoose.Schema.ObjectId],
  instructor: mongoose.Schema.ObjectId,
  teachingAssistant: mongoose.Schema.ObjectId,
  courseSpecs: {
    courseData: {
      lectures: Number,
      contactHourse: Number,
      specialization: String,
    },
    courseAims: String,
    courseContent: String,
    studentAcademicCounselingSupport: [String],
    courseLearningOutcomes: [
      {
        title: String,
        learningOutcomes: [
          {
            code: String,
            description: String,
            mappedCompetence: [String], //Competence Code
            learningTeachingMethods: [
              {
                type: String,
                enum: [
                  "face-to-face-lecture",
                  "online-leacture",
                  "tutorial-exercise",
                  "group-discussions",
                  "laboratory",
                  "self-reading",
                  "presentation",
                  "team-project",
                  "research-and-reporting",
                  "brainstorming",
                ],
              },
            ],
            studentAssessmentMethods: [
              {
                type: String,
                enum: [
                  "written-exams",
                  "online-exams",
                  "lab-exams",
                  "pop-quizzes",
                  "in-class-problem-solving",
                  "take-home-exam",
                  "research-assignments",
                  "reporting-assignments",
                  "project-assignments",
                  "in-class-questions",
                ],
              },
            ],
          },
        ],
      },
    ],
    leacturePlan: {
      expectedStudyingHoursePerWeek: Number,
      topics: [
        {
          week: Number,
          topics: [String],
          plannedHours: Number,
          learningOutcomes: [
            {
              code: String,
              selected: {
                type: Boolean,
                default: false,
              },
            },
          ],
        },
      ],
    },
    studentAssessment: {
      assessmentSchedulesWeight: [
        {
          assessment: String,
          week: {
            type: [
              {
                type: Number,
                default: -1, //means that no week is specified (as scehduled)
              },
            ],
          },
          weight: Number,
        },
      ],
    },
    facilities: [String],
    references: {
      courseNotes: String,
      bookes: [String],
      recommendedBooks: [String],
      courseWebsites: [String],
    },
  },
  avgCompetences: {
    type: [
      {
        code: {
          type: String,
        },
        avg: {
          type: Number,
        },
      },
    ],
  },
});

courseInstanceSchema.pre(/^find/, function (next) {
  this.populate({ path: "course", select: "-__v -questions" });

  next();
});

courseInstanceSchema.pre("find", function (next) {
  this.select("-courseSpecs");
  next();
});

const CourseInstance = new mongoose.model(
  "courseInstance",
  courseInstanceSchema
);

module.exports = CourseInstance;
