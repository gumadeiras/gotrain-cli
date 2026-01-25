import os
import shutil
import subprocess
import tempfile
import unittest

# Path to the project root
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GOTRAIN_BIN = os.path.join(PROJECT_ROOT, "gotrain")
TESTS_BIN = os.path.join(PROJECT_ROOT, "tests", "bin")

class TestGoTrain(unittest.TestCase):
    def setUp(self):
        # Create a temporary cache directory
        self.test_dir = tempfile.mkdtemp()
        self.cache_dir = os.path.join(self.test_dir, "cache")
        os.makedirs(self.cache_dir)
        
        # Setup environment
        self.env = os.environ.copy()
        self.env["XDG_CACHE_HOME"] = self.cache_dir
        # Prepend our mock bin to PATH
        self.env["PATH"] = f"{TESTS_BIN}:{self.env.get('PATH', '')}"

    def strip_ansi(self, text):
        import re
        ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
        return ansi_escape.sub('', text)
        
    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def run_gotrain(self, args):
        cmd = [GOTRAIN_BIN] + args
        result = subprocess.run(
            cmd, 
            env=self.env, 
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE, 
            text=True
        )
        return result

    def test_stations(self):
        """Test listing stations (should use mock curl)"""
        result = self.run_gotrain(["stations"])
        if result.returncode != 0:
            print(f"STDOUT: {result.stdout}")
            print(f"STDERR: {result.stderr}")
        self.assertEqual(result.returncode, 0)
        output = self.strip_ansi(result.stdout)
        self.assertIn("NYC Transit Stations", output)
        self.assertIn("Grand Central", output)
        self.assertIn("MNR-1", output)
        self.assertIn("MNR", output) 

    def test_stations_filter(self):
        """Test filtering stations"""
        result = self.run_gotrain(["stations", "penn"])
        self.assertEqual(result.returncode, 0)
        output = self.strip_ansi(result.stdout)
        self.assertIn("Penn Station", output)
        self.assertNotIn("Grand Central", output)

    def test_departures(self):
        """Test departures board"""
        # Test departures for Grand Central (MNR-1)
        result = self.run_gotrain(["departures", "MNR-1"])
        if result.returncode != 0:
            print("DEPARTURES FAIL:")
            print(result.stderr)
        self.assertEqual(result.returncode, 0)
        output = self.strip_ansi(result.stdout)
        self.assertIn("Departures for Grand Central (MNR-1)", output)
        self.assertIn("New Haven", output)
        self.assertIn("Track 14", output)
        self.assertIn("Delayed", output) 
    
    def test_alerts(self):
        """Test alerts listing and filtering"""
        result = self.run_gotrain(["alerts"])
        self.assertEqual(result.returncode, 0)
        output = self.strip_ansi(result.stdout)
        self.assertIn("Hudson Line Delays", output)
        self.assertIn("Showing top 10 of 2", output)
        
        # Test filtering
        result = self.run_gotrain(["alerts", "--station", "Grand Central"])
        self.assertEqual(result.returncode, 0)
        output = self.strip_ansi(result.stdout)
        self.assertIn("Filtering for: Grand Central", output)
        self.assertIn("Elevator Outage", output)
        self.assertNotIn("Hudson Line Delays", output)

    def test_favorites(self):
        """Test adding and removing favorites"""
        # Add
        result = self.run_gotrain(["fav", "add", "MNR-1", "gc"])
        self.assertEqual(result.returncode, 0)
        output = self.strip_ansi(result.stdout)
        self.assertIn("Added MNR-1 to favorites", output)
        
        # List
        result = self.run_gotrain(["favs"])
        output = self.strip_ansi(result.stdout)
        self.assertIn("Grand Central", output)
        self.assertIn("(Alias: gc)", output)
        
        # Remove
        result = self.run_gotrain(["fav", "rm", "gc"])
        self.assertEqual(result.returncode, 0)
        output = self.strip_ansi(result.stdout)
        self.assertIn("Removed MNR-1", output)
        
        # List empty
        result = self.run_gotrain(["favs"])
        output = self.strip_ansi(result.stdout)
        self.assertIn("No favorites", output)

if __name__ == '__main__':
    unittest.main()
