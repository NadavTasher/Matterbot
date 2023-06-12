import logging

from puppy.http.client import HTTPClient
from puppy.simple.database import Database

class Client(object):
    
	def __init__(self, hostname, username, password):
		# Store user variables
		self.id = None
		self.token = None

		# Store internal variables
		self.hostname = hostname
		self.username = username
		self.password = password

		# Create HTTP client
		self.client = HTTPClient()

		# Store some indexes as databases
		self.database = Database("/opt/%s" % hostname)

		# Make sure database structure is OK
		if "ids" not in self.database:
			self.database.ids = []
		if "tree" not in self.database:
			self.database.tree = {}
		if "users" not in self.database:
			self.database.users = {}

	def call(self, path, parameters=None, data=None):
		# Send a request to the server
		self.client.request()

	def login(self):
		pass