"use strict";

const assert = require("node:assert/strict");

const {mock_esm, zrequire} = require("./lib/namespace.cjs");
const {run_test} = require("./lib/test.cjs");

require("./lib/zjquery.cjs");

mock_esm("../src/i18n", {
    $t: ({defaultMessage}) => defaultMessage,
});
mock_esm("../src/upload", {
    upload_recorded_audio_file() {},
});

const voice_record = zrequire("voice_record");

run_test("normalize_audio_mime_type strips the codecs parameter", () => {
    // MediaRecorder tags blobs like "audio/webm;codecs=opus", but the upload
    // code matches file.type by exact membership in the supported-audio set, so
    // the codecs parameter must be dropped or the recording renders as a plain
    // download link instead of an inline audio player.
    assert.equal(voice_record.normalize_audio_mime_type("audio/webm;codecs=opus"), "audio/webm");
    assert.equal(voice_record.normalize_audio_mime_type("audio/mp4;codecs=mp4a.40.2"), "audio/mp4");
    assert.equal(
        voice_record.normalize_audio_mime_type("  audio/webm ; codecs=opus"),
        "audio/webm",
    );
    assert.equal(voice_record.normalize_audio_mime_type("audio/mp4"), "audio/mp4");
    assert.equal(voice_record.normalize_audio_mime_type(""), "");
});

run_test("extension_for_mime_type maps to a sensible file extension", () => {
    assert.equal(voice_record.extension_for_mime_type("audio/mp4"), "m4a");
    assert.equal(voice_record.extension_for_mime_type("audio/mpeg"), "mp3");
    assert.equal(voice_record.extension_for_mime_type("audio/wav"), "wav");
    assert.equal(voice_record.extension_for_mime_type("audio/x-wav"), "wav");
    assert.equal(voice_record.extension_for_mime_type("audio/vnd.wave"), "wav");
    assert.equal(voice_record.extension_for_mime_type("audio/webm"), "webm");
    // Unrecognized containers fall back to a webm extension.
    assert.equal(voice_record.extension_for_mime_type("audio/ogg"), "webm");
});
