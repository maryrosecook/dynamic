var timeline = require("../src/timeline");

describe("timeline", function() {
  describe("transposeFrameTimeToCurrentLoop", function() {
    it("doesn't transp earlier frame if drawing", function() {
      var now = 7;
      var frameTime = 5;
      var firstFrameTime = 3;
      var lastFrameTime = 7;
      expect(timeline.transposeFrameTimeToCurrentLoop(
        now,
        frameTime,
        firstFrameTime,
        lastFrameTime)).toEqual(frameTime);
    });

    it("transps mid-anim frame when drawing over", function() {
      var now = 21;
      var frameTime = 4;
      var firstFrameTime = 3;
      var lastFrameTime = 7;
      expect(timeline.transposeFrameTimeToCurrentLoop(
        now,
        frameTime,
        firstFrameTime,
        lastFrameTime)).toEqual(19);
    });

    it("transps mid-anim frame when drawing over", function() {
      var now = 22;
      var frameTime = 7;
      var firstFrameTime = 3;
      var lastFrameTime = 7;
      expect(timeline.transposeFrameTimeToCurrentLoop(
        now,
        frameTime,
        firstFrameTime,
        lastFrameTime)).toEqual(22);
    });
  });
});
