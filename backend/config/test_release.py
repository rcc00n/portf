import os
from unittest.mock import patch
from django.test import SimpleTestCase
from release import main


class ReleaseCommandTests(SimpleTestCase):
    @patch.dict(os.environ, {"RACCN_RELEASE_PORTFOLIO": ""})
    @patch("release.subprocess.run")
    def test_ordinary_release_does_not_overwrite_cms(self, run):
        main()
        self.assertEqual(run.call_count, 1)
        self.assertIn("migrate", run.call_args.args[0])

    @patch.dict(os.environ, {"RACCN_RELEASE_PORTFOLIO": "2026-11-25"})
    @patch("release.subprocess.run")
    def test_explicit_release_uses_reviewed_identity_mapping(self, run):
        main()
        self.assertEqual(run.call_count, 2)
        arguments = run.call_args_list[1].args[0]
        self.assertIn("publish_release_portfolio", arguments)
        self.assertIn("renter:7", arguments)
        self.assertIn("bad-guy-motors:5", arguments)

    @patch.dict(os.environ, {"RACCN_RELEASE_PORTFOLIO": "unreviewed"})
    @patch("release.subprocess.run")
    def test_unreviewed_import_never_runs(self, run):
        with self.assertRaises(SystemExit):
            main()
        run.assert_not_called()
