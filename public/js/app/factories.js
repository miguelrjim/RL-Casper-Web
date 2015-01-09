angular.module('CasperWeb.Factories', []).
factory('socketRL', ['socketFactory', function(socketFactory) {
	var mySocket = socketFactory();
	mySocket.forward(['finished', 'retry', 'err', 'list', 'ready', 'start']);
	return mySocket;
}]);