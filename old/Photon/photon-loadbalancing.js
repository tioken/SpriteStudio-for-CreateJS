var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Photon;
(function (Photon) {
    /// <reference path="photon.ts"/>
    /// <reference path="photon-loadbalancing-constants.ts"/>
    /**
    Photon Load Balancing API
    @namespace Photon.LoadBalancing
    */
    (function (LoadBalancing) {
        var Actor = (function () {
            /**
            @classdesc Summarizes a "player" within a room, identified (in that room) by ID (or "actorNr"). Extend to implement custom logic.
            @constructor Photon.LoadBalancing.Actor
            @param {string} name Actor name.
            @param {number} actorNr Actor ID.
            @param {boolean} isLocal Actor is local.
            */
            function Actor(name, actorNr, isLocal) {
                this.name = name;
                this.actorNr = actorNr;
                this.isLocal = isLocal;
                this.customProperties = {};
            }
            // public getLoadBalancingClient() { return this.loadBalancingClient; }
            /**
            @summary Actor's room: the room initialized by client for create room operation or room client connected to.
            @method Photon.LoadBalancing.Actor#getRoom
            @returns {Photon.LoadBalancing.Room} Actor's room.
            */
            Actor.prototype.getRoom = function () {
                return this.loadBalancingClient.myRoom();
            };

            /**
            @summary Raises game custom event.
            @method Photon.LoadBalancing.Actor#raiseEvent
            @param {number} eventCode Identifies this type of event (and the content). Your game's event codes can start with 0.
            @param {object} [data] Custom data you want to send along (use null, if none).
            @param {object} [options] Additional options
            @property {object} options Additional options
            @property {number} [options.interestGroup] The ID of the interest group this event goes to (exclusively).
            @property {Photon.LoadBalancing.Constants.EventCaching} [options.cache=EventCaching.DoNotCache] Events can be cached (merged and removed) for players joining later on.
            @property {Photon.LoadBalancing.Constants.ReceiverGroup} [options.receivers=ReceiverGroup.Others] Defines to which group of players the event is passed on.
            @property {number[]} [options.targetActors] Defines the target players who should receive the event (use only for small target groups).
            */
            Actor.prototype.raiseEvent = function (eventCode, data, options) {
                if (this.loadBalancingClient) {
                    this.loadBalancingClient.raiseEvent(eventCode, data, options);
                }
            };

            /**
            @summary Sets actor name.
            @method Photon.LoadBalancing.Actor#setName
            @param {string} name Actor name.
            */
            Actor.prototype.setName = function (name) {
                this.name = name;
            };

            // properties methods
            /**
            @summary Called on every actor properties update: properties set by client, poperties update from server.
            Override to update custom room state.
            @method Photon.LoadBalancing.Actor#onPropertiesChange
            @param {object} changedCustomProps Key-value map of changed properties.
            @param {boolean} [byClient] true if properties set by client.
            */
            Actor.prototype.onPropertiesChange = function (changedCustomProps, byClient) {
            };

            /**
            @summary Returns custom property by name.
            @method Photon.LoadBalancing.Actor#getCustomProperty
            @param {string} name Name of the property.
            @returns {object} Property or undefined if property not found.
            */
            Actor.prototype.getCustomProperty = function (name) {
                return this.customProperties[name];
            };

            /**
            @summary Returns custom property by name or default value.
            @method Photon.LoadBalancing.Actor#getCustomPropertyOrElse
            @param {string} name Name of the property.
            @param {object} defaultValue Default property value.
            @returns {object} Property or default value if property not found.
            */
            Actor.prototype.getCustomPropertyOrElse = function (name, defaultValue) {
                return Exitgames.Common.Util.getPropertyOrElse(this.customProperties, name, defaultValue);
            };

            /**
            @summary Sets custom property.
            @method Photon.LoadBalancing.Actor#setCustomProperty
            @param {string} name Name of the property.
            @param {object} value Property value.
            */
            Actor.prototype.setCustomProperty = function (name, value) {
                this.customProperties[name] = value;
                if (this.loadBalancingClient && this.loadBalancingClient.isJoinedToRoom()) {
                    var props = {};
                    props[name] = value;
                    this.loadBalancingClient._setPropertiesOfActor(props);
                    this.onPropertiesChange(props, true);
                }
            };

            /**
            @summary For local actor, returns join token automatically saved after last room join.
            @method Photon.LoadBalancing.Actor#getJoinToken
            @returns {string} Join token.
            */
            Actor.prototype.getJoinToken = function () {
                return this.joinToken;
            };

            Actor.prototype._getAllProperties = function () {
                var p = {};
                p[LoadBalancing.Constants.ActorProperties.PlayerName] = this.name;
                for (var k in this.customProperties) {
                    p[k] = this.customProperties[k];
                }
                return p;
            };

            Actor.prototype._setLBC = function (lbc) {
                this.loadBalancingClient = lbc;
            };

            Actor.prototype._updateFromResponse = function (vals) {
                this.actorNr = vals[LoadBalancing.Constants.ParameterCode.ActorNr];
                var props = vals[LoadBalancing.Constants.ParameterCode.PlayerProperties];
                if (props !== undefined) {
                    var name = props[LoadBalancing.Constants.ActorProperties.PlayerName];
                    if (name !== undefined) {
                        this.name = name;
                    }
                    this._updateCustomProperties(props);
                }
            };

            Actor.prototype._updateMyActorFromResponse = function (vals) {
                this.actorNr = vals[LoadBalancing.Constants.ParameterCode.ActorNr];
                this.joinToken = this.actorNr ? this.actorNr.toString() : null;
            };

            Actor.prototype._updateCustomProperties = function (vals) {
                for (var p in vals) {
                    this.customProperties[p] = vals[p];
                }
                this.onPropertiesChange(vals, false);
            };

            Actor._getActorNrFromResponse = function (vals) {
                return vals[LoadBalancing.Constants.ParameterCode.ActorNr];
            };
            return Actor;
        })();
        LoadBalancing.Actor = Actor;

        // readonly room info from server
        var RoomInfo = (function () {
            /**
            @classdesc Used for Room listings of the lobby (not yet joining). Offers the basic info about a room: name, player counts, properties, etc.
            @constructor Photon.LoadBalancing.RoomInfo
            @param {string} name Room name.
            */
            function RoomInfo(name) {
                // standard room properties
                // TODO: access via getters
                /**
                @summary Room name.
                @member Photon.LoadBalancing.RoomInfo#name
                @type {string}
                @readonly
                */
                this.name = "";
                /**
                @summary Joined room Game server address.
                @member Photon.LoadBalancing.RoomInfo#address
                @type {string}
                @readonly
                */
                this.address = "";
                /**
                @summary Max players before room is considered full.
                @member Photon.LoadBalancing.RoomInfo#maxPlayers
                @type {number}
                @readonly
                */
                this.maxPlayers = 0;
                /**
                @summary Shows the room in the lobby's room list. Makes sense only for local room.
                @member Photon.LoadBalancing.RoomInfo#isVisible
                @type {boolean}
                @readonly
                */
                this.isVisible = true;
                /**
                @summary Defines if this room can be joined.
                @member Photon.LoadBalancing.RoomInfo#isOpen
                @type {boolean}
                @readonly
                */
                this.isOpen = true;
                /**
                @summary Count of player currently in room.
                @member Photon.LoadBalancing.RoomInfo#playerCount
                @type {number}
                @readonly
                */
                this.playerCount = 0;
                /**
                @summary Time in ms indicating how long the room instance will be keeped alive in the server room cache after all clients have left the room.
                @member Photon.LoadBalancing.RoomInfo#emptyRoomLiveTime
                @type {number}
                @readonly
                */
                this.emptyRoomLiveTime = 0;
                /**
                @summary Room removed (in room list updates).
                @member Photon.LoadBalancing.RoomInfo#removed
                @type {boolean}
                @readonly
                */
                this.removed = false;
                // TODO: does end user need this?
                this.cleanupCacheOnLeave = false;
                // custom properties
                this._customProperties = {};
                this._propsListedInLobby = [];
                this.name = name;
            }
            /**
            @summary Called on every room properties update: room creation, properties set by client, poperties update from server.
            Override to update custom room state.
            @method Photon.LoadBalancing.RoomInfo#onPropertiesChange
            @param {object} changedCustomProps Key-value map of changed properties.
            @param {boolean} [byClient] true if called on room creation or properties set by client.
            */
            RoomInfo.prototype.onPropertiesChange = function (changedCustomProps, byClient) {
            };

            /**
            @summary Returns custom property by name.
            @method Photon.LoadBalancing.RoomInfo#getCustomProperty
            @param {string} name Name of the property.
            @returns {object} Property or undefined if property not found.
            */
            RoomInfo.prototype.getCustomProperty = function (prop) {
                return this._customProperties[prop];
            };

            /**
            @summary Returns custom property by name or default value.
            @method Photon.LoadBalancing.RoomInfo#getCustomPropertyOrElse
            @param {string} name Name of the property.
            @param {object} defaultValue Default property value.
            @returns {object} Property or default value if property not found.
            */
            RoomInfo.prototype.getCustomPropertyOrElse = function (prop, defaultValue) {
                return Exitgames.Common.Util.getPropertyOrElse(this._customProperties, prop, defaultValue);
            };

            RoomInfo.prototype._updateFromMasterResponse = function (vals) {
                this.address = vals[LoadBalancing.Constants.ParameterCode.Address];
                var name = vals[LoadBalancing.Constants.ParameterCode.RoomName];
                if (name) {
                    this.name = name;
                }
            };

            RoomInfo.prototype._updateFromProps = function (props, customProps) {
                if (typeof customProps === "undefined") { customProps = null; }
                if (props) {
                    this.maxPlayers = this.updateIfExists(this.maxPlayers, LoadBalancing.Constants.GameProperties.MaxPlayers, props);
                    this.isVisible = this.updateIfExists(this.isVisible, LoadBalancing.Constants.GameProperties.IsVisible, props);
                    this.isOpen = this.updateIfExists(this.isOpen, LoadBalancing.Constants.GameProperties.IsOpen, props);
                    this.playerCount = this.updateIfExists(this.playerCount, LoadBalancing.Constants.GameProperties.PlayerCount, props);
                    this.removed = this.updateIfExists(this.removed, LoadBalancing.Constants.GameProperties.Removed, props);
                    this._propsListedInLobby = this.updateIfExists(this._propsListedInLobby, LoadBalancing.Constants.GameProperties.PropsListedInLobby, props);
                    this.cleanupCacheOnLeave = this.updateIfExists(this.cleanupCacheOnLeave, LoadBalancing.Constants.GameProperties.CleanupCacheOnLeave, props);
                    var changedProps = {};
                    if (customProps === null) {
                        customProps = props;
                    }
                    for (var k in customProps) {
                        if (parseInt(k).toString() != k) {
                            if (this._customProperties[k] !== customProps[k]) {
                                this._customProperties[k] = customProps[k];
                                changedProps[k] = customProps[k];
                            }
                        }
                    }
                    this.onPropertiesChange(changedProps, false);
                }
            };

            RoomInfo.prototype.updateIfExists = function (prevValue, code, props) {
                if (props.hasOwnProperty(code)) {
                    return props[code];
                } else {
                    return prevValue;
                }
            };
            return RoomInfo;
        })();
        LoadBalancing.RoomInfo = RoomInfo;

        // joined room with writable properties
        var Room = (function (_super) {
            __extends(Room, _super);
            /**
            @classdesc Represents a room client joins or is joined to. Extend to implement custom logic. Custom properties can be set via setCustomProperty() while being in the room.
            @mixes Photon.LoadBalancing.RoomInfo
            @constructor Photon.LoadBalancing.Room
            @param {string} name Room name.
            */
            function Room(name) {
                _super.call(this, name);
            }
            // room created from client via factory always has this field set
            //public getLoadBalancingClient() { return this.loadBalancingClient; }
            /**
            @summary Sets custom property
            @method Photon.LoadBalancing.Room#setCustomProperty
            @param {string} name Name of the property.
            @param {object} value Property value.
            */
            Room.prototype.setCustomProperty = function (name, value) {
                this._customProperties[name] = value;
                if (this.loadBalancingClient && this.loadBalancingClient.isJoinedToRoom()) {
                    var props = {};
                    props[name] = value;
                    this.loadBalancingClient._setPropertiesOfRoom(props);
                }
                var cp = {};
                cp[name] = value;
                this.onPropertiesChange(cp, true);
            };

            Room.prototype.setProp = function (name, value) {
                if (this.loadBalancingClient && this.loadBalancingClient.isJoinedToRoom()) {
                    var props = {};
                    props[name] = value;
                    this.loadBalancingClient._setPropertiesOfRoom(props);
                }
            };

            /**
            * @summary Sets rooms visibility in the lobby's room list.
            * @method Photon.LoadBalancing.Room#setIsOpen
            * @param {boolean} isVisible New visibility value.
            */
            Room.prototype.setIsVisible = function (isVisible) {
                if (this.isVisible != isVisible) {
                    this.isVisible = isVisible;
                    this.setProp(LoadBalancing.Constants.GameProperties.IsVisible, isVisible);
                }
            };

            /**
            * @summary Sets if this room can be joined.
            * @method Photon.LoadBalancing.Room#setIsOpen
            * @param {boolean} isOpen New property value.
            */
            Room.prototype.setIsOpen = function (isOpen) {
                if (this.isOpen == !isOpen) {
                    this.isOpen = isOpen;
                    this.setProp(LoadBalancing.Constants.GameProperties.IsOpen, isOpen);
                }
            };

            /**
            * @summary Sets max players before room is considered full.
            * @method Photon.LoadBalancing.Room#setMaxPlayers
            * @param {number} maxPlayers New max players value.
            */
            Room.prototype.setMaxPlayers = function (maxPlayers) {
                if (this.maxPlayers != maxPlayers) {
                    this.maxPlayers = maxPlayers;
                    this.setProp(LoadBalancing.Constants.GameProperties.MaxPlayers, maxPlayers);
                }
            };

            /**
            * @summary Sets room live time in the server room cache after all clients have left the room.
            * @method Photon.LoadBalancing.Room#setEmptyRoomLiveTime
            * @param {number} emptyRoomLiveTime New live time value in ms.
            */
            Room.prototype.setEmptyRoomLiveTime = function (emptyRoomLiveTime) {
                this.emptyRoomLiveTime = emptyRoomLiveTime;
            };

            /**
            @summary Sets list of the room properties to pass to the RoomInfo list in a lobby.
            @method Photon.LoadBalancing.Room#setPropsListedInLobby
            @param {string[]} props Array of properties names.
            */
            Room.prototype.setPropsListedInLobby = function (props) {
                this._propsListedInLobby = props;
            };

            Room.prototype._setLBC = function (lbc) {
                this.loadBalancingClient = lbc;
            };
            return Room;
        })(RoomInfo);
        LoadBalancing.Room = Room;

        var LoadBalancingClient = (function () {
            /**
            @classdesc Implements the Photon LoadBalancing workflow. This class should be extended to handle system or custom events and operation responses.
            @constructor Photon.LoadBalancing.LoadBalancingClient
            @param {string} masterServerAddress Master server address:port.
            @param {string} appId Cloud application ID.
            @param {string} appVersion Cloud application version.
            */
            function LoadBalancingClient(masterServerAddress, appId, appVersion) {
                this.masterServerAddress = masterServerAddress;
                this.appId = appId;
                this.appVersion = appVersion;
                // lobbyName and lobbyType passed to JoinLobby operation (we don't have separate JoinLobby operation and set them in connect())
                this.connectOptions = {};
                // shares lobby info between Master and Game CreateGame calls (createRoomInternal)
                this.createRoomOptions = {};
                // shares options between Master and Game JoinGame operations
                this.joinRoomOptions = {};
                this.reconnectPending = false;
                this.roomInfos = new Array();
                this.actors = {};
                this.userAuthType = LoadBalancing.Constants.CustomAuthenticationType.None;
                this.userAuthParameters = "";
                this.userAuthSecret = "";
                this.lobbyStatsRequestList = new Array();
                this.state = LoadBalancingClient.State.Uninitialized;
                this.logger = new Exitgames.Common.Logger("LoadBalancingClient");
                this.validNextState = {};
                this.initValidNextState();
                this.currentRoom = this.roomFactoryInternal("");
                this._myActor = this.actorFactoryInternal("", -1, true);
                this.addActor(this._myActor);
            }
            // override to handle system events:
            /**
            @summary Called on client state change. Override to handle it.
            @method Photon.LoadBalancing.LoadBalancingClient#onStateChange
            @param {Photon.LoadBalancing.LoadBalancingClient.State} state New client state.
            */
            LoadBalancingClient.prototype.onStateChange = function (state) {
            };

            /**
            @summary Called if client error occures. Override to handle it.
            @method Photon.LoadBalancing.LoadBalancingClient#onError
            @param {Photon.LoadBalancing.LoadBalancingClient.PeerErrorCode} errorCode Client error code.
            @param {string} errorMsg Error message.
            */
            LoadBalancingClient.prototype.onError = function (errorCode, errorMsg) {
                this.logger.error("Load Balancing Client Error", errorCode, errorMsg);
            };

            /**
            @summary Called on operation response. Override if need custom workflow or response error handling.
            @method Photon.LoadBalancing.LoadBalancingClient#onOperationResponse
            @param {number} errorCode Server error code.
            @param {string} errorMsg Error message.
            @param {Photon.LoadBalancing.Constants.OperationCode} code Operation code.
            @param {object} content Operation response content.
            */
            LoadBalancingClient.prototype.onOperationResponse = function (errorCode, errorMsg, code, content) {
            };

            /**
            @summary Called on custom event. Override to handle it.
            @method Photon.LoadBalancing.LoadBalancingClient#onEvent
            @param {number} code Event code.
            @param {object} content Event content.
            @param {number} actorNr Actor ID event raised by.
            */
            LoadBalancingClient.prototype.onEvent = function (code, content, actorNr) {
            };

            /**
            @summary Called on room list received from Master server (on connection). Override to handle it.
            @method Photon.LoadBalancing.LoadBalancingClient#onRoomList
            @param {Photon.LoadBalancing.RoomInfo[]} rooms Room list.
            */
            LoadBalancingClient.prototype.onRoomList = function (rooms) {
            };

            /**
            @summary Called on room list updates received from Master server. Override to handle it.
            @method Photon.LoadBalancing.LoadBalancingClient#onRoomListUpdate
            @param {Photon.LoadBalancing.RoomInfo[]} rooms Updated room list.
            @param {Photon.LoadBalancing.RoomInfo[]} roomsUpdated Rooms whose properties were changed.
            @param {Photon.LoadBalancing.RoomInfo[]} roomsAdded New rooms in list.
            @param {Photon.LoadBalancing.RoomInfo[]} roomsRemoved Rooms removed from list.
            */
            LoadBalancingClient.prototype.onRoomListUpdate = function (rooms, roomsUpdated, roomsAdded, roomsRemoved) {
            };

            // TODO: move to Room? Or remove and use Room.onPropertiesChange only?
            /**
            @summary Called on joined room properties changed event. Override to handle it.
            @method Photon.LoadBalancing.LoadBalancingClient#onMyRoomPropertiesChange
            */
            LoadBalancingClient.prototype.onMyRoomPropertiesChange = function () {
            };

            /**
            @summary Called on actor properties changed event. Override to handle it.
            @method Photon.loadbalancing.loadbalancingClient#onActorPropertiesChange
            @param {Photon.LoadBalancing.Actor} actor Actor whose properties were changed.
            */
            LoadBalancingClient.prototype.onActorPropertiesChange = function (actor) {
            };

            /**
            @summary Called when client joins room. Override to handle it.
            @method Photon.LoadBalancing.LoadBalancingClient#onJoinRoom
            */
            LoadBalancingClient.prototype.onJoinRoom = function () {
            };

            /**
            @summary Called when new actor joins the room client joined to. Override to handle it.
            @method Photon.LoadBalancing.LoadBalancingClient#onActorJoin
            @param {Photon.LoadBalancing.Actor} actor New actor.
            */
            LoadBalancingClient.prototype.onActorJoin = function (actor) {
            };

            /**
            @summary Called when actor leaves the room client joined to. Override to handle it.
            @method Photon.LoadBalancing.LoadBalancingClient#onActorLeave
            @param {Photon.LoadBalancing.Actor} actor Actor left the room.
            */
            LoadBalancingClient.prototype.onActorLeave = function (actor) {
            };

            /**
            @summary Called when {@link Photon.LoadBalancing.LoadBalancingClient#findFriends findFriends} request completed. <br/>
            Override to handle request results.
            @method Photon.LoadBalancing.LoadBalancingClient#onFindFriendsResult
            @param {number} errorCode Result error code. 0 if request is successful.
            @param {string} errorMsg Error message.
            @param {object} friends Table with actors names as keys and friend statuses as values: {name1: friendStatus1, name2: friendStatus2, ... }.
            @property {object} friendStatus Friend status.
            @property {boolean} friendStatus.online Online status.
            @property {string} friendStatus.roomId Joined room.
            */
            LoadBalancingClient.prototype.onFindFriendsResult = function (errorCode, errorMsg, friends) {
            };

            /**
            @summary Called when lobbies statistics update received. <br/>
            Update can be automated by set up during {@link Photon.LoadBalancing.LoadBalancingClient#connect connect} or requested explicitly by {@link Photon.LoadBalancing.LoadBalancingClient#requestLobbyStats requestLobbyStats}. <br/>
            Override to handle request results.
            @method Photon.LoadBalancing.LoadBalancingClient#onLobbyStats
            @param {number} errorCode Result error code. 0 if request is successful. For automated updates is always 0.
            @param {string} errorMsg Error message. For automated updates is always empty.
            @param {object[]} lobbies Array of lobbies statistics: [lobbyStats1, lobbyStats1, ... ].
            @property {object} lobbyStats Lobby statistics.
            @property {string} lobbyStats.lobbyName Lobby name.
            @property {number} lobbyStats.lobbyType Lobby type.
            @property {number} lobbyStats.peerCount The number of players in the lobby (on Master, not playing).
            @property {number} lobbyStats.gameCount The number of games in the lobby.
            */
            LoadBalancingClient.prototype.onLobbyStats = function (errorCode, errorMsg, lobbies) {
            };

            /**
            @summary Called when application statistics update received. <br/>
            Override to handle request results.
            @method Photon.LoadBalancing.LoadBalancingClient#onAppStats
            @param {number} errorCode Result error code. Currently is always 0.
            @param {string} errorMsg Error message. Currently is always empty.
            @param {object} stats Application statistics.
            @property {object} stats Application statistics.
            @property {number} stats.peerCount Count of players currently online on Game servers.
            @property {number} stats.masterPeerCount Count of players on Master server (looking for game).
            @property {number} stats.gameCount Count of games currently in use (includes invisible and full rooms, so it doesn't match lobby list).
            */
            LoadBalancingClient.prototype.onAppStats = function (errorCode, errorMsg, stats) {
            };

            /**
            @summary Override with creation of custom room (extended from Room): { return new CustomRoom(...); }
            @method Photon.LoadBalancing.LoadBalancingClient#roomFactory
            @param {string} name Room name. Pass to super() in custom actor constructor.
            */
            LoadBalancingClient.prototype.roomFactory = function (name) {
                return new Room(name);
            };

            /**
            @summary Override with creation of custom actor (extended from Actor): { return new CustomActor(...); }
            @method Photon.LoadBalancing.LoadBalancingClient#actorFactory
            @param {string} name Actor name. Pass to super() in custom room constructor.
            @param {number} actorNr Actor ID. Pass to super() in custom room constructor.
            @param {boolean} isLocal Actor is local. Pass to super() in custom room constructor.
            */
            LoadBalancingClient.prototype.actorFactory = function (name, actorNr, isLocal) {
                return new Actor(name, actorNr, isLocal);
            };

            //------------------------
            /**
            @summary Returns local actor.
            Client always has local actor even if not joined.
            @method Photon.LoadBalancing.LoadBalancingClient#myActor
            @returns {Photon.LoadBalancing.Actor} Local actor.
            */
            LoadBalancingClient.prototype.myActor = function () {
                return this._myActor;
            };

            /**
            @summary Returns client's room.
            Client always has it's room even if not joined. It's used for room creation operation.
            @method Photon.LoadBalancing.LoadBalancingClient#myRoom
            @returns {Photon.LoadBalancing.Room} Current room.
            */
            LoadBalancingClient.prototype.myRoom = function () {
                return this.currentRoom;
            };

            /**
            @summary Returns actors in room client currently joined including local actor.
            @method Photon.LoadBalancing.LoadBalancingClient#myRoomActors
            @returns {Photon.LoadBalancing.Room[]} Room actors list.
            */
            LoadBalancingClient.prototype.myRoomActors = function () {
                return this.actors;
            };

            LoadBalancingClient.prototype.roomFactoryInternal = function (name) {
                if (typeof name === "undefined") { name = ""; }
                var r = this.roomFactory(name);
                r._setLBC(this);
                return r;
            };
            LoadBalancingClient.prototype.actorFactoryInternal = function (name, actorNr, isLocal) {
                if (typeof name === "undefined") { name = ""; }
                if (typeof actorNr === "undefined") { actorNr = -1; }
                if (typeof isLocal === "undefined") { isLocal = false; }
                var a = this.actorFactory(name, actorNr, isLocal);
                a._setLBC(this);
                return a;
            };

            /**
            @summary Enables custom authentication and sets it's parameters.
            @method Photon.LoadBalancing.LoadBalancingClient#setCustomAuthentication
            @param {string} authParameters This string must contain any (http get) parameters expected by the used authentication service.
            @param {Photon.LoadBalancing.Constants.CustomAuthenticationType} [authType=Photon.LoadBalancing.Constants.CustomAuthenticationType.Custom] The type of custom authentication provider that should be used.
            */
            LoadBalancingClient.prototype.setCustomAuthentication = function (authParameters, authType) {
                if (typeof authType === "undefined") { authType = Photon.LoadBalancing.Constants.CustomAuthenticationType.Custom; }
                this.userAuthType = authType;
                this.userAuthParameters = authParameters;
            };

            // TODO: remove backward compatibility (deprecated)
            /**
            @summary Starts connection to Master server.
            @method Photon.LoadBalancing.LoadBalancingClient#connect
            @param {object} [options] Additional options
            @property {object} options Additional options
            @property {boolean} [options.keepMasterConnection=false] Don't disconnect from Master server after joining room.
            @property {string} [options.lobbyName] Name of the lobby connect to.
            @property {Photon.LoadBalancing.Constants.LobbyType} [options.lobbyType=LobbyType.Default] Type of the lobby.
            @property {boolean} [options.lobbyStats=false] If true, Master server will be sending lobbies statistics periodically.<br/> Override {@link Photon.LoadBalancing.LoadBalancingClient#onLobbyStats onLobbyStats} to handle request results.<br/>Alternatively, {@link Photon.LoadBalancing.LoadBalancingClient#requestLobbyStats requestLobbyStats} can be used.
            */
            LoadBalancingClient.prototype.connect = function (options) {
                if (typeof (options) === "boolean") {
                    if (options) {
                        options = { keepMasterConnection: true };
                    } else {
                        options = { keepMasterConnection: false };
                    }
                }

                if (!options) {
                    options = {};
                }

                this.reconnectPending = false;
                if (this.checkNextState(LoadBalancingClient.State.ConnectingToMasterserver)) {
                    this.changeState(LoadBalancingClient.State.ConnectingToMasterserver);
                    this.logger.info("Connecting to Master", this.masterServerAddress);

                    // make options copy to protect
                    this.connectOptions = {};
                    for (var k in options)
                        this.connectOptions[k] = options[k];

                    this.masterPeer = new MasterPeer(this, "ws://" + this.masterServerAddress, "");
                    this.initMasterPeer(this.masterPeer);
                    this.masterPeer.connect();
                    return true;
                } else {
                    return false;
                }
            };

            /**
            @summary Creates a new room on the server (or fails when the name is already taken). Takes parameters (except name) for new room from myRoom() object. Set them before call.
            @method Photon.LoadBalancing.LoadBalancingClient#createRoomFromMy
            @param {string} [roomName] New room name. Assigned automatically by server if empty or not specified.
            @param {object} [options] Additional options
            @property {object} options Additional options
            @property {string} [options.lobbyName] Name of the lobby to create room in.
            @property {Photon.LoadBalancing.Constants.LobbyType} [options.lobbyType=LobbyType.Default] Type of the lobby.
            */
            LoadBalancingClient.prototype.createRoomFromMy = function (roomName, options) {
                this.currentRoom.name = roomName ? roomName : "";
                return this.createRoomInternal(this.masterPeer, options);
            };

            /**
            @summary Creates a new room on the server (or fails when the name is already taken).
            @method Photon.LoadBalancing.LoadBalancingClient#createRoom
            @param {string} [roomName] The name to create a room with. Must be unique and not in use or can't be created. If not specified or null, the server will assign a GUID as name.
            @param {object} [options] Additional options
            @property {object} options Additional options
            @property {boolean} [options.isVisible=true] Shows the room in the lobby's room list.
            @property {boolean} [options.isOpen=true] Keeps players from joining the room (or opens it to everyone).
            @property {number} [options.maxPlayers=0] Max players before room is considered full (but still listed).
            @property {object} [options.customGameProperties] Custom properties to apply to the room on creation (use string-typed keys but short ones).
            @property {string[]} [options.propsListedInLobby] Defines the custom room properties that get listed in the lobby.
            @property {number} [options.emptyRoomLiveTime=0] Room live time (ms) in the server room cache after all clients have left the room.
            @property {string} [options.lobbyName] Name of the lobby to create room in.
            @property {Photon.LoadBalancing.Constants.LobbyType} [options.lobbyType=LobbyType.Default] Type of the lobby.
            
            */
            LoadBalancingClient.prototype.createRoom = function (roomName, options) {
                this.currentRoom = this.roomFactoryInternal(roomName ? roomName : "");

                if (options) {
                    if (options.isVisible !== undefined)
                        this.currentRoom.isVisible = options.isVisible;
                    if (options.isOpen !== undefined)
                        this.currentRoom.isOpen = options.isOpen;
                    if (options.maxPlayers !== undefined)
                        this.currentRoom.maxPlayers = options.maxPlayers;
                    if (options.customGameProperties !== undefined)
                        this.currentRoom._customProperties = options.customGameProperties;
                    if (options.propsListedInLobby !== undefined)
                        this.currentRoom._propsListedInLobby = options.propsListedInLobby;
                    if (options.emptyRoomLiveTime !== undefined)
                        this.currentRoom.emptyRoomLiveTime = options.emptyRoomLiveTime;
                }

                this.currentRoom.onPropertiesChange(this.currentRoom._customProperties, true);

                return this.createRoomInternal(this.masterPeer, options);
            };

            /**
            @summary Joins a room by name and sets this player's properties.
            @method Photon.LoadBalancing.LoadBalancingClient#joinRoom
            @param {string} roomName The name of the room to join. Must be existing already, open and non-full or can't be joined.
            @param {object} [options] Additional options
            @property {object} options Additional options
            @property {string} [options.joinToken=null] Try to rejoin with given token. Set to {@link Photon.LoadBalancing.Actor#getJoinToken myActor().getJoinToken()} to use last automatically saved token.
            @property {boolean} [options.createIfNotExists=false] Create room if not exists.
            @property {string} [options.lobbyName=""] Name of the lobby to create room in.
            @property {Photon.LoadBalancing.Constants.LobbyType} [options.lobbyType=LobbyType.Default] Type of the lobby.
            
            */
            LoadBalancingClient.prototype.joinRoom = function (roomName, options) {
                var op = [];

                if (options) {
                    if (options.createIfNotExists) {
                        op.push(LoadBalancing.Constants.ParameterCode.CreateIfNotExists);
                        op.push(true);
                    }
                    if (options.lobbyName) {
                        op.push(LoadBalancing.Constants.ParameterCode.LobbyName);
                        op.push(options.lobbyName);
                        if (options.lobbyType != undefined) {
                            op.push(LoadBalancing.Constants.ParameterCode.LobbyType);
                            op.push(options.lobbyType);
                        }
                    }
                }

                this.currentRoom = this.roomFactoryInternal(roomName);
                op.push(LoadBalancing.Constants.ParameterCode.RoomName);
                op.push(roomName);

                this.joinRoomOptions = { joinToken: options && options.joinToken, createIfNotExists: options && options.createIfNotExists };

                this.logger.info("Join Room", roomName, options && options.lobbyName, options && options.lobbyType, "...");

                this.masterPeer.sendOperation(LoadBalancing.Constants.OperationCode.JoinGame, op);
                return true;
            };

            /**
            @summary Joins a random, available room.
            This operation fails if all rooms are closed or full.
            @method Photon.LoadBalancing.LoadBalancingClient#joinRandomRoom
            @param {object} [options] Additional options
            @property {object} options Additional options
            @property {object} [options.expectedCustomRoomProperties] If specified, a room will only be joined, if it matches these custom properties. Use null to accept rooms with any properties.
            @property {number} [options.expectedMaxPlayers] If specified, filters for a particular maxPlayer setting. Use 0 to accept any maxPlayer value.
            @property {Photon.LoadBalancing.Constants.MatchmakingMode} [options.matchmakingMode=MatchmakingMode.FillRoom] Selects one of the available matchmaking algorithms.
            @property {string} [options.lobbyName] Name of the lobby to search rooms in.
            @property {Photon.LoadBalancing.Constants.LobbyType} [options.lobbyType=LobbyType.Default] Type of the lobby.
            @property {string} [options.sqlLobbyFilter] Basically the "where" clause of a sql statement. Examples: 'C0 = 1 AND C2 > 50'. 'C5 = "Map2" AND C2 > 10 AND C2 < 20'
            */
            LoadBalancingClient.prototype.joinRandomRoom = function (options) {
                var op = [];
                if (options) {
                    if (options.matchingType != undefined && options.matchingType != LoadBalancing.Constants.MatchmakingMode.FillRoom) {
                        op.push(LoadBalancing.Constants.ParameterCode.MatchMakingType);
                        op.push(options.matchingType);
                    }

                    var expectedRoomProperties = {};
                    var propNonEmpty = false;
                    if (options.expectedCustomRoomProperties != undefined) {
                        for (var k in options.expectedCustomRoomProperties) {
                            expectedRoomProperties[k] = options.expectedCustomRoomProperties[k];
                            propNonEmpty = true;
                        }
                    }
                    if (options.expectedMaxPlayers != undefined && options.expectedMaxPlayers > 0) {
                        expectedRoomProperties[LoadBalancing.Constants.GameProperties.MaxPlayers] = options.expectedMaxPlayers;
                        propNonEmpty = true;
                    }
                    if (propNonEmpty) {
                        op.push(LoadBalancing.Constants.ParameterCode.GameProperties);
                        op.push(expectedRoomProperties);
                    }
                    if (options.lobbyName) {
                        op.push(LoadBalancing.Constants.ParameterCode.LobbyName);
                        op.push(options.lobbyName);
                        if (options.lobbyType != undefined) {
                            op.push(LoadBalancing.Constants.ParameterCode.LobbyType);
                            op.push(options.lobbyType);
                        }
                    }

                    if (options.sqlLobbyFilter) {
                        op.push(LoadBalancing.Constants.ParameterCode.Data);
                        op.push(options.sqlLobbyFilter);
                    }
                }

                this.logger.info("Join Random Room", options && options.lobbyName, options && options.lobbyType, "...");
                this.masterPeer.sendOperation(LoadBalancing.Constants.OperationCode.JoinRandomGame, op);
                return true;
            };

            LoadBalancingClient.prototype._setPropertiesOfRoom = function (properties) {
                var op = [];
                op.push(LoadBalancing.Constants.ParameterCode.Properties);
                op.push(properties);
                op.push(LoadBalancing.Constants.ParameterCode.Broadcast);
                op.push(true);

                this.gamePeer.sendOperation(LoadBalancing.Constants.OperationCode.SetProperties, op);
            };

            LoadBalancingClient.prototype._setPropertiesOfActor = function (properties) {
                var op = [];
                op.push(LoadBalancing.Constants.ParameterCode.ActorNr);
                op.push(this.myActor().actorNr);
                op.push(LoadBalancing.Constants.ParameterCode.Properties);
                op.push(properties);
                op.push(LoadBalancing.Constants.ParameterCode.Broadcast);
                op.push(true);

                this.gamePeer.sendOperation(LoadBalancing.Constants.OperationCode.SetProperties, op);
            };

            /**
            @summary Disconnects from Master and Game servers.
            @method Photon.LoadBalancing.LoadBalancingClient#disconnect
            */
            LoadBalancingClient.prototype.disconnect = function () {
                if (this.state != LoadBalancingClient.State.Uninitialized) {
                    if (this.masterPeer) {
                        this.masterPeer.disconnect();
                    }
                    if (this.gamePeer) {
                        this.gamePeer.disconnect();
                    }
                    this.changeState(LoadBalancingClient.State.Disconnecting);
                }
            };

            /**
            @summary Leaves room and connects to Master server if not connected.
            @method Photon.LoadBalancing.LoadBalancingClient#leaveRoom
            */
            LoadBalancingClient.prototype.leaveRoom = function () {
                if (this.isJoinedToRoom()) {
                    if (this.gamePeer) {
                        this.reconnectPending = true;
                        this.gamePeer.disconnect();
                    }
                    this.changeState(LoadBalancingClient.State.Disconnecting);
                }
            };

            /**
            @summary Raises game custom event
            @method Photon.LoadBalancing.LoadBalancingClient#raiseEvent
            @param {number} eventCode Identifies this type of event (and the content). Your game's event codes can start with 0.
            @param {object} [data] Custom data you want to send along (use null, if none).
            @param {object} [options] Additional options
            @property {object} options Additional options
            @property {number} [options.interestGroup] The ID of the interest group this event goes to (exclusively).
            @property {Photon.LoadBalancing.Constants.EventCaching} [options.cache=EventCaching.DoNotCache] Events can be cached (merged and removed) for players joining later on.
            @property {Photon.LoadBalancing.Constants.ReceiverGroup} [options.receivers=ReceiverGroup.Others] Defines to which group of players the event is passed on.
            @property {number[]} [options.targetActors] Defines the target players who should receive the event (use only for small target groups).
            */
            LoadBalancingClient.prototype.raiseEvent = function (eventCode, data, options) {
                if (this.isJoinedToRoom()) {
                    this.gamePeer.raiseEvent(eventCode, data, options);
                }
            };

            /**
            @summary Changes client's interest groups (for events in room).
            First, removing groups is executed. This way, you could leave all groups and join only the ones provided.
            @method Photon.LoadBalancing.LoadBalancingClient#changeGroups
            @param {number[]} groupsToRemove Groups to remove from interest. Null will not leave any. A [] will remove all.
            @param {number[]} groupsToAdd Groups to add to interest. Null will not add any. A [] will add all current.
            */
            LoadBalancingClient.prototype.changeGroups = function (groupsToRemove, groupsToAdd) {
                if (this.isJoinedToRoom()) {
                    this.logger.debug("Group change:", groupsToRemove, groupsToAdd);
                    this.gamePeer.changeGroups(groupsToRemove, groupsToAdd);
                }
            };

            /**
            @summary Requests Master server for actors online status and joined rooms.<br/>
            Override {@link Photon.LoadBalancing.LoadBalancingClient#onFindFriendsResult onFindFriendsResult} to handle request results.
            @method Photon.LoadBalancing.LoadBalancingClient#findFriends
            @param {string[]} friendsToFind Actors names.
            **/
            LoadBalancingClient.prototype.findFriends = function (friendsToFind) {
                if (this.isConnectedToMaster()) {
                    if (friendsToFind && typeof (friendsToFind) == "object") {
                        this.findFriendsRequestList = new Array();
                        for (var i = 0; i < friendsToFind.length; ++i) {
                            if (typeof (friendsToFind[i]) == "string") {
                                this.findFriendsRequestList[i] = friendsToFind[i];
                            } else {
                                this.logger.error("FindFriends request error:", "Friend name is not a string", i);
                                this.onFindFriendsResult(1101, "Friend name is not a string" + " " + i, {});
                                return;
                            }
                        }
                        this.logger.debug("Find friends:", friendsToFind);
                        this.masterPeer.findFriends(this.findFriendsRequestList);
                    } else {
                        this.logger.error("FindFriends request error:", "Parameter is not an array");
                        this.onFindFriendsResult(1101, "Parameter is not an array", {});
                    }
                } else {
                    this.logger.error("FindFriends request error:", "Not connected to Master");
                    this.onFindFriendsResult(1001, "Not connected to Master", {});
                }
            };

            /**
            @summary Requests Master server for lobbies statistics.<br/>
            Override {@link Photon.LoadBalancing.LoadBalancingClient#onLobbyStats onLobbyStats} to handle request results.<br/>
            Alternatively, automated updates can be set up during {@link Photon.LoadBalancing.LoadBalancingClient#connect connect}.
            @method Photon.LoadBalancing.LoadBalancingClient#requestLobbyStats
            @param {any[][]} lobbiesToRequest Array of lobbies id pairs [ [lobbyName1, lobbyType1], [lobbyName2, lobbyType2], ... ]. If not specified or null, statistics for all lobbies requested.
            
            **/
            LoadBalancingClient.prototype.requestLobbyStats = function (lobbiesToRequest) {
                if (this.isConnectedToMaster()) {
                    this.lobbyStatsRequestList = new Array();
                    if (lobbiesToRequest) {
                        if (typeof (lobbiesToRequest) == "object") {
                            for (var i = 0; i < lobbiesToRequest.length; ++i) {
                                var l = lobbiesToRequest[i];
                                if (typeof (l) == "object") {
                                    var n = l[0];
                                    if (n) {
                                        var t;
                                        if (l[1] === undefined) {
                                            t = LoadBalancing.Constants.LobbyType.Default;
                                        } else {
                                            if (typeof (l[1]) == "number") {
                                                t = l[1];
                                            } else {
                                                this.requestLobbyStatsErr("Lobby type is invalid", i);
                                                return;
                                            }
                                        }
                                        this.lobbyStatsRequestList[i] = [n.toString(), t];
                                    } else {
                                        this.requestLobbyStatsErr("Lobby name is empty", i);
                                        return;
                                    }
                                } else {
                                    this.requestLobbyStatsErr("Lobby id is not an array", i);
                                    return;
                                }
                            }
                        } else {
                            this.requestLobbyStatsErr("Parameter is not an array");
                            return;
                        }
                    }
                    this.masterPeer.requestLobbyStats(this.lobbyStatsRequestList);
                } else {
                    this.logger.error("LobbyState request error:", "Not connected to Master");
                    this.onLobbyStats(1001, "Not connected to Master", []);
                }
            };
            LoadBalancingClient.prototype.requestLobbyStatsErr = function (m, other) {
                if (typeof other === "undefined") { other = ""; }
                this.logger.error("LobbyState request error:", m, other);
                this.onLobbyStats(1101, m + " " + other, []);
            };

            /**
            @summary Checks if client is connected to Master server (usually joined to lobby and receives room list updates).
            @method Photon.LoadBalancing.LoadBalancingClient#isConnectedToMaster
            @returns {boolean} True if client is connected to Master server.
            */
            LoadBalancingClient.prototype.isConnectedToMaster = function () {
                return this.masterPeer && this.masterPeer.isConnected();
            };

            /**
            @summary Checks if client is in lobby and ready to join or create game.
            @method Photon.LoadBalancing.LoadBalancingClient#isInLobby
            @returns {boolean} True if client is in lobby.
            */
            LoadBalancingClient.prototype.isInLobby = function () {
                return this.state == LoadBalancingClient.State.JoinedLobby;
            };

            /**
            @summary Checks if client is joined to game.
            @method Photon.LoadBalancing.LoadBalancingClient#isJoinedToRoom
            @returns {boolean} True if client is joined to game.
            */
            LoadBalancingClient.prototype.isJoinedToRoom = function () {
                return this.state == LoadBalancingClient.State.Joined;
            };

            /**
            @deprecated Use isJoinedToRoom()
            */
            LoadBalancingClient.prototype.isConnectedToGame = function () {
                return this.isJoinedToRoom();
            };

            /**
            @summary Current room list from Master server.
            @method Photon.LoadBalancing.LoadBalancingClient#availableRooms
            @returns {RoomInfo[]} Current room list
            */
            LoadBalancingClient.prototype.availableRooms = function () {
                return this.roomInfos;
            };

            /**
            @summary Sets client logger level
            @method Photon.LoadBalancing.LoadBalancingClient#setLogLevel
            @param {Exitgames.Common.Logger.Level} level Logging level.
            */
            LoadBalancingClient.prototype.setLogLevel = function (level) {
                this.logger.setLevel(level);
                if (this.masterPeer) {
                    this.masterPeer.setLogLevel(level);
                }
                if (this.gamePeer) {
                    this.gamePeer.setLogLevel(level);
                }
            };

            LoadBalancingClient.prototype.addActor = function (a) {
                this.actors[a.actorNr] = a;
            };

            LoadBalancingClient.prototype.changeState = function (nextState) {
                this.logger.info("State:", LoadBalancingClient.StateToName(this.state), "->", LoadBalancingClient.StateToName(nextState));
                this.state = nextState;
                this.onStateChange(nextState);
            };

            LoadBalancingClient.prototype.createRoomInternal = function (peer, options) {
                var gp = {};
                gp[LoadBalancing.Constants.GameProperties.IsOpen] = this.currentRoom.isOpen;
                gp[LoadBalancing.Constants.GameProperties.IsVisible] = this.currentRoom.isVisible;
                if (this.currentRoom.maxPlayers > 0) {
                    gp[LoadBalancing.Constants.GameProperties.MaxPlayers] = this.currentRoom.maxPlayers;
                }
                if (this.currentRoom._propsListedInLobby && this.currentRoom._propsListedInLobby.length > 0) {
                    gp[LoadBalancing.Constants.GameProperties.PropsListedInLobby] = this.currentRoom._propsListedInLobby;
                }
                for (var p in this.currentRoom._customProperties) {
                    gp[p] = this.currentRoom._customProperties[p];
                }
                var op = [];
                if (this.currentRoom.name) {
                    op.push(LoadBalancing.Constants.ParameterCode.RoomName);
                    op.push(this.currentRoom.name);
                }
                op.push(LoadBalancing.Constants.ParameterCode.GameProperties);
                op.push(gp);
                op.push(LoadBalancing.Constants.ParameterCode.CleanupCacheOnLeave);
                op.push(true);
                op.push(LoadBalancing.Constants.ParameterCode.Broadcast);
                op.push(true);
                if (this.currentRoom.emptyRoomLiveTime != 0) {
                    op.push(LoadBalancing.Constants.ParameterCode.EmptyRoomLiveTime);
                    op.push(this.currentRoom.emptyRoomLiveTime);
                }

                if (options) {
                    if (options.lobbyName) {
                        op.push(LoadBalancing.Constants.ParameterCode.LobbyName);
                        op.push(options.lobbyName);
                        if (options.lobbyType != undefined) {
                            op.push(LoadBalancing.Constants.ParameterCode.LobbyType);
                            op.push(options.lobbyType);
                        }
                    }
                }

                if (peer === this.masterPeer) {
                    this.createRoomOptions = options;
                }

                if (peer === this.gamePeer) {
                    op.push(LoadBalancing.Constants.ParameterCode.PlayerProperties);
                    op.push(this._myActor._getAllProperties());
                }

                var log = peer == this.gamePeer ? this.gamePeer._logger : this.masterPeer._logger;
                log.info("Create Room", options && options.lobbyName, options && options.lobbyType, "...");

                peer.sendOperation(LoadBalancing.Constants.OperationCode.CreateGame, op);
            };

            LoadBalancingClient.prototype.initMasterPeer = function (mp) {
                var _this = this;
                mp.setLogLevel(this.logger.getLevel());

                // errors
                mp.addPeerStatusListener(Photon.PhotonPeer.StatusCodes.error, function () {
                    _this.changeState(LoadBalancingClient.State.Error);
                    _this.onError(LoadBalancingClient.PeerErrorCode.MasterError, "Master peer error");
                });
                mp.addPeerStatusListener(Photon.PhotonPeer.StatusCodes.connectFailed, function () {
                    _this.changeState(LoadBalancingClient.State.Error);
                    _this.onError(LoadBalancingClient.PeerErrorCode.MasterConnectFailed, "Master peer connect failed: " + _this.masterServerAddress);
                });
                mp.addPeerStatusListener(Photon.PhotonPeer.StatusCodes.timeout, function () {
                    _this.changeState(LoadBalancingClient.State.Error);
                    _this.onError(LoadBalancingClient.PeerErrorCode.MasterTimeout, "Master peer error timeout");
                });
                mp.addPeerStatusListener(Photon.PhotonPeer.StatusCodes.connecting, function () {
                });

                // status
                mp.addPeerStatusListener(Photon.PhotonPeer.StatusCodes.connect, function () {
                    mp._logger.info("Connected");

                    //TODO: encryption phase
                    var op = [];
                    op.push(LoadBalancing.Constants.ParameterCode.ApplicationId);
                    op.push(_this.appId);
                    op.push(LoadBalancing.Constants.ParameterCode.AppVersion);
                    op.push(_this.appVersion);
                    if (_this.userAuthType != LoadBalancing.Constants.CustomAuthenticationType.None) {
                        op.push(LoadBalancing.Constants.ParameterCode.ClientAuthenticationType);
                        op.push(_this.userAuthType);
                        op.push(LoadBalancing.Constants.ParameterCode.ClientAuthenticationParams);
                        op.push(_this.userAuthParameters);
                    }
                    if (_this._myActor.name) {
                        op.push(LoadBalancing.Constants.ParameterCode.UserId);
                        op.push(_this._myActor.name);
                    }
                    if (_this.connectOptions.lobbyStats) {
                        op.push(LoadBalancing.Constants.ParameterCode.LobbyStats);
                        op.push(true);
                    }
                    mp.sendOperation(LoadBalancing.Constants.OperationCode.Authenticate, op);
                    mp._logger.info("Authenticate...");
                });
                mp.addPeerStatusListener(Photon.PhotonPeer.StatusCodes.disconnect, function () {
                    mp._logger.info("Disconnected");
                });
                mp.addPeerStatusListener(Photon.PhotonPeer.StatusCodes.connectClosed, function () {
                    mp._logger.info("Server closed connection");
                    _this.changeState(LoadBalancingClient.State.Error);
                    _this.onError(LoadBalancingClient.PeerErrorCode.MasterConnectClosed, "Master server closed connection");
                });

                //events
                mp.addEventListener(LoadBalancing.Constants.EventCode.GameList, function (data) {
                    var gameList = data.vals[LoadBalancing.Constants.ParameterCode.GameList];
                    _this.roomInfos = new Array();
                    for (var g in gameList) {
                        var r = new RoomInfo(g);
                        r._updateFromProps(gameList[g]);
                        _this.roomInfos.push(r);
                    }
                    _this.onRoomList(_this.roomInfos);
                    mp._logger.debug("ev GameList", _this.roomInfos, gameList);
                });
                mp.addEventListener(LoadBalancing.Constants.EventCode.GameListUpdate, function (data) {
                    var gameList = data.vals[LoadBalancing.Constants.ParameterCode.GameList];
                    var roomsUpdated = new Array();
                    var roomsAdded = new Array();
                    var roomsRemoved = new Array();
                    for (var g in gameList) {
                        var exist = _this.roomInfos.filter(function (x) {
                            return x.name == g;
                        });
                        if (exist.length > 0) {
                            var r = exist[0];
                            r._updateFromProps(gameList[g]);
                            if (r.removed) {
                                roomsRemoved.push(r);
                            } else {
                                roomsUpdated.push(r);
                            }
                        } else {
                            var ri = new RoomInfo(g);
                            ri._updateFromProps(gameList[g]);
                            _this.roomInfos.push(ri);
                            roomsAdded.push(r);
                        }
                    }
                    _this.roomInfos = _this.roomInfos.filter(function (x) {
                        return !x.removed;
                    });
                    _this.onRoomListUpdate(_this.roomInfos, roomsUpdated, roomsAdded, roomsRemoved);
                    mp._logger.debug("ev GameListUpdate:", _this.roomInfos, "u:", roomsUpdated, "a:", roomsAdded, "r:", roomsRemoved, gameList);
                });

                // responses - check operation result: data.errCode
                mp.addResponseListener(LoadBalancing.Constants.OperationCode.Authenticate, function (data) {
                    mp._logger.debug("resp Authenticate", data);
                    if (!data.errCode) {
                        mp._logger.info("Authenticated");
                        _this.userAuthSecret = data.vals[LoadBalancing.Constants.ParameterCode.Secret];
                        _this.changeState(LoadBalancingClient.State.ConnectedToMaster);
                        var op = [];
                        if (_this.connectOptions.lobbyName) {
                            op.push(LoadBalancing.Constants.ParameterCode.LobbyName);
                            op.push(_this.connectOptions.lobbyName);
                            if (_this.connectOptions.lobbyType != undefined) {
                                op.push(LoadBalancing.Constants.ParameterCode.LobbyType);
                                op.push(_this.connectOptions.lobbyType);
                            }
                        }
                        mp.sendOperation(LoadBalancing.Constants.OperationCode.JoinLobby, op);
                        mp._logger.info("Join Lobby", _this.connectOptions.lobbyName, _this.connectOptions.lobbyType, "...");
                    } else {
                        _this.changeState(LoadBalancingClient.State.Error);
                        _this.onError(LoadBalancingClient.PeerErrorCode.MasterAuthenticationFailed, "Master authentication failed");
                    }
                });
                mp.addResponseListener(LoadBalancing.Constants.OperationCode.JoinLobby, function (data) {
                    mp._logger.debug("resp JoinLobby", data);
                    if (!data.errCode) {
                        mp._logger.info("Joined to Lobby");
                        _this.changeState(LoadBalancingClient.State.JoinedLobby);
                    }
                    _this._onOperationResponseInternal2(LoadBalancing.Constants.OperationCode.JoinLobby, data);
                });
                mp.addResponseListener(LoadBalancing.Constants.OperationCode.CreateGame, function (data) {
                    mp._logger.debug("resp CreateGame", data);
                    if (!data.errCode) {
                        _this.currentRoom._updateFromMasterResponse(data.vals);
                        mp._logger.debug("Created/Joined " + _this.currentRoom.name);
                        _this.connectToGameServer(LoadBalancing.Constants.OperationCode.CreateGame);
                    }

                    _this._onOperationResponseInternal2(LoadBalancing.Constants.OperationCode.CreateGame, data);
                });
                mp.addResponseListener(LoadBalancing.Constants.OperationCode.JoinGame, function (data) {
                    mp._logger.debug("resp JoinGame", data);
                    if (!data.errCode) {
                        _this.currentRoom._updateFromMasterResponse(data.vals);
                        mp._logger.debug("Joined " + _this.currentRoom.name);
                        _this.connectToGameServer(LoadBalancing.Constants.OperationCode.JoinGame);
                    }

                    _this._onOperationResponseInternal2(LoadBalancing.Constants.OperationCode.JoinGame, data);
                });
                mp.addResponseListener(LoadBalancing.Constants.OperationCode.JoinRandomGame, function (data) {
                    mp._logger.debug("resp JoinRandomGame", data);
                    if (!data.errCode) {
                        _this.currentRoom._updateFromMasterResponse(data.vals);
                        mp._logger.debug("Joined " + _this.currentRoom.name);
                        _this.connectToGameServer(LoadBalancing.Constants.OperationCode.JoinRandomGame);
                    }

                    _this._onOperationResponseInternal2(LoadBalancing.Constants.OperationCode.JoinRandomGame, data);
                });

                mp.addResponseListener(LoadBalancing.Constants.OperationCode.FindFriends, function (data) {
                    mp._logger.debug("resp FindFriends", data);
                    var res = {};
                    if (!data.errCode) {
                        var onlines = data.vals[LoadBalancing.Constants.ParameterCode.FindFriendsResponseOnlineList] || {};
                        var roomIds = data.vals[LoadBalancing.Constants.ParameterCode.FindFriendsResponseRoomIdList] || {};
                        for (var i = 0; i < _this.findFriendsRequestList.length; ++i) {
                            var name = _this.findFriendsRequestList[i];
                            if (name) {
                                res[name] = { online: onlines[i], roomId: roomIds[i] };
                            }
                        }
                    } else {
                        mp._logger.error("FindFriends request error:", data.errCode);
                    }
                    _this.onFindFriendsResult(data.errCode, data.errMsg, res);
                });

                mp.addResponseListener(LoadBalancing.Constants.OperationCode.LobbyStats, function (data) {
                    mp._logger.debug("resp LobbyStats", data);
                    var res = new Array();
                    if (!data.errCode) {
                        var names = data.vals[LoadBalancing.Constants.ParameterCode.LobbyName];
                        var types = data.vals[LoadBalancing.Constants.ParameterCode.LobbyType] || {};
                        var peers = data.vals[LoadBalancing.Constants.ParameterCode.PeerCount] || {};
                        var games = data.vals[LoadBalancing.Constants.ParameterCode.GameCount] || {};

                        if (names) {
                            for (var i = 0; i < names.length; ++i) {
                                res[i] = { lobbyName: names[i], lobbyType: types[i], peerCount: peers[i], gameCount: games[i] };
                            }
                        } else {
                            for (var i = 0; i < _this.lobbyStatsRequestList.length; ++i) {
                                var l = _this.lobbyStatsRequestList[i];
                                res[i] = { lobbyName: l[0], lobbyType: l[1], peerCount: peers[i], gameCount: games[i] };
                            }
                        }
                    } else {
                        mp._logger.error("LobbyStats request error:", data.errCode);
                    }
                    _this.onLobbyStats(data.errCode, data.errMsg, res);
                });
                mp.addEventListener(LoadBalancing.Constants.EventCode.LobbyStats, function (data) {
                    mp._logger.debug("ev LobbyStats", data);
                    var res = new Array();
                    var names = data.vals[LoadBalancing.Constants.ParameterCode.LobbyName];
                    var types = data.vals[LoadBalancing.Constants.ParameterCode.LobbyType] || {};
                    var peers = data.vals[LoadBalancing.Constants.ParameterCode.PeerCount] || {};
                    var games = data.vals[LoadBalancing.Constants.ParameterCode.GameCount] || {};

                    if (names) {
                        for (var i = 0; i < names.length; ++i) {
                            res[i] = { lobbyName: names[i], lobbyType: types[i], peerCount: peers[i], gameCount: games[i] };
                        }
                    }

                    _this.onLobbyStats(0, "", res);
                });
                mp.addEventListener(LoadBalancing.Constants.EventCode.AppStats, function (data) {
                    mp._logger.debug("ev AppStats", data);
                    var res = {
                        peerCount: data.vals[LoadBalancing.Constants.ParameterCode.PeerCount],
                        masterPeerCount: data.vals[LoadBalancing.Constants.ParameterCode.MasterPeerCount],
                        gameCount: data.vals[LoadBalancing.Constants.ParameterCode.GameCount]
                    };
                    _this.onAppStats(0, "", res);
                });
            };

            LoadBalancingClient.prototype.connectToGameServer = function (masterOpCode) {
                if (!this.connectOptions.keepMasterConnection) {
                    this.masterPeer.disconnect();
                }
                if (this.checkNextState(LoadBalancingClient.State.ConnectingToGameserver)) {
                    this.logger.info("Connecting to Game", this.currentRoom.address);
                    this.gamePeer = new GamePeer(this, "ws://" + this.currentRoom.address, "");
                    this.initGamePeer(this.gamePeer, masterOpCode);
                    if (!this.connectOptions.keepMasterConnection) {
                        this.masterPeer.disconnect();
                    }
                    this.gamePeer.connect();
                    this.changeState(LoadBalancingClient.State.ConnectingToGameserver);
                    return true;
                } else {
                    return false;
                }
            };
            LoadBalancingClient.prototype.initGamePeer = function (gp, masterOpCode) {
                var _this = this;
                gp.setLogLevel(this.logger.getLevel());

                // errors
                gp.addPeerStatusListener(Photon.PhotonPeer.StatusCodes.error, function () {
                    _this.changeState(LoadBalancingClient.State.Error);
                    _this.onError(LoadBalancingClient.PeerErrorCode.GameError, "Game peer error");
                });
                gp.addPeerStatusListener(Photon.PhotonPeer.StatusCodes.connectFailed, function () {
                    _this.changeState(LoadBalancingClient.State.Error);
                    _this.onError(LoadBalancingClient.PeerErrorCode.GameConnectFailed, "Game peer connect failed: " + _this.currentRoom.address);
                });
                gp.addPeerStatusListener(Photon.PhotonPeer.StatusCodes.timeout, function () {
                    _this.changeState(LoadBalancingClient.State.Error);
                    _this.onError(LoadBalancingClient.PeerErrorCode.GameTimeout, "Game peer timeout");
                });

                // status
                gp.addPeerStatusListener(Photon.PhotonPeer.StatusCodes.connect, function () {
                    gp._logger.info("Connected");

                    //TODO: encryption phase
                    var op = [];
                    op.push(LoadBalancing.Constants.ParameterCode.ApplicationId);
                    op.push(_this.appId);
                    op.push(LoadBalancing.Constants.ParameterCode.AppVersion);
                    op.push(_this.appVersion);
                    if (_this.userAuthType != LoadBalancing.Constants.CustomAuthenticationType.None) {
                        op.push(LoadBalancing.Constants.ParameterCode.ClientAuthenticationType);
                        op.push(_this.userAuthType);
                        op.push(LoadBalancing.Constants.ParameterCode.Secret);
                        op.push(_this.userAuthSecret);
                    }
                    if (_this._myActor.name) {
                        op.push(LoadBalancing.Constants.ParameterCode.UserId);
                        op.push(_this._myActor.name);
                    }
                    gp.sendOperation(LoadBalancing.Constants.OperationCode.Authenticate, op);
                    gp._logger.info("Authenticate...");
                });
                gp.addPeerStatusListener(Photon.PhotonPeer.StatusCodes.disconnect, function () {
                    for (var i in _this.actors) {
                        _this.onActorLeave(_this.actors[i]);
                    }
                    _this.actors = {};
                    _this.addActor(_this._myActor);
                    gp._logger.info("Disconnected");

                    if (_this.masterPeer && _this.masterPeer.isConnected()) {
                        _this.changeState(LoadBalancingClient.State.JoinedLobby);
                    } else {
                        _this.changeState(LoadBalancingClient.State.Disconnected);
                        if (_this.reconnectPending) {
                            _this.connect(_this.connectOptions);
                        }
                    }
                });
                gp.addPeerStatusListener(Photon.PhotonPeer.StatusCodes.connectClosed, function () {
                    gp._logger.info("Server closed connection");
                    _this.changeState(LoadBalancingClient.State.Error);
                    _this.onError(LoadBalancingClient.PeerErrorCode.MasterConnectClosed, "Game server closed connection");
                });

                // responses
                gp.addResponseListener(LoadBalancing.Constants.OperationCode.Authenticate, function (data) {
                    gp._logger.debug("resp Authenticate", data);
                    if (!data.errCode) {
                        gp._logger.info("Authenticated");
                        gp._logger.info("Connected");
                        if (masterOpCode == LoadBalancing.Constants.OperationCode.CreateGame) {
                            _this.createRoomInternal(gp, _this.createRoomOptions);
                        } else {
                            var op = [];
                            op.push(LoadBalancing.Constants.ParameterCode.RoomName);
                            op.push(_this.currentRoom.name);

                            op.push(LoadBalancing.Constants.ParameterCode.Broadcast);
                            op.push(true);

                            op.push(LoadBalancing.Constants.ParameterCode.PlayerProperties);
                            op.push(_this._myActor._getAllProperties());

                            if (masterOpCode == LoadBalancing.Constants.OperationCode.JoinGame) {
                                if (_this.joinRoomOptions.createIfNotExists) {
                                    op.push(LoadBalancing.Constants.ParameterCode.CreateIfNotExists);
                                    op.push(true);
                                }
                                if (_this.joinRoomOptions.joinToken) {
                                    op.push(LoadBalancing.Constants.ParameterCode.ActorNr);
                                    op.push(parseInt(_this.joinRoomOptions.joinToken));
                                }
                            }
                            gp.sendOperation(LoadBalancing.Constants.OperationCode.JoinGame, op);
                        }
                        _this.changeState(LoadBalancingClient.State.ConnectedToGameserver);
                    } else {
                        _this.changeState(LoadBalancingClient.State.Error);
                        _this.onError(LoadBalancingClient.PeerErrorCode.GameAuthenticationFailed, "Game authentication failed");
                    }
                });
                gp.addResponseListener(LoadBalancing.Constants.OperationCode.CreateGame, function (data) {
                    gp._logger.debug("resp CreateGame", data);
                    if (!data.errCode) {
                        _this._myActor._updateMyActorFromResponse(data.vals);
                        gp._logger.info("myActor: ", _this._myActor);
                        _this.currentRoom._updateFromProps(data.vals[LoadBalancing.Constants.ParameterCode.GameProperties]);

                        _this.actors = {};
                        _this.addActor(_this._myActor);

                        _this.changeState(LoadBalancingClient.State.Joined);
                        _this.onJoinRoom();
                    }

                    _this._onOperationResponseInternal2(LoadBalancing.Constants.OperationCode.CreateGame, data);
                });
                gp.addResponseListener(LoadBalancing.Constants.OperationCode.JoinGame, function (data) {
                    gp._logger.debug("resp JoinGame", data);
                    if (!data.errCode) {
                        _this._myActor._updateMyActorFromResponse(data.vals);
                        gp._logger.info("myActor: ", _this._myActor);
                        _this.currentRoom._updateFromProps(data.vals[LoadBalancing.Constants.ParameterCode.GameProperties]);

                        _this.actors = {};
                        _this.addActor(_this._myActor);
                        var actorList = data.vals[LoadBalancing.Constants.ParameterCode.PlayerProperties];
                        for (var k in actorList) {
                            var a = _this.actorFactoryInternal(actorList[k][LoadBalancing.Constants.ActorProperties.PlayerName], parseInt(k));
                            a._updateCustomProperties(actorList[k]);
                            _this.addActor(a);
                        }

                        _this.changeState(LoadBalancingClient.State.Joined);
                        _this.onJoinRoom();
                    }

                    _this._onOperationResponseInternal2(LoadBalancing.Constants.OperationCode.JoinGame, data);
                });
                gp.addResponseListener(LoadBalancing.Constants.OperationCode.SetProperties, function (data) {
                    gp._logger.debug("resp SetProperties", data);

                    //                if (!data.errCode) { }
                    _this._onOperationResponseInternal2(LoadBalancing.Constants.OperationCode.SetProperties, data);
                });

                // events
                gp.addEventListener(LoadBalancing.Constants.EventCode.Join, function (data) {
                    gp._logger.debug("ev Join", data);
                    if (Actor._getActorNrFromResponse(data.vals) === _this._myActor.actorNr) {
                        //this._myActor._updateMyActorFromResponse(data.vals);
                        _this._myActor._updateFromResponse(data.vals);
                        _this.addActor(_this._myActor);
                    } else {
                        var actor = _this.actorFactoryInternal();
                        actor._updateFromResponse(data.vals);
                        _this.addActor(actor);
                        _this.onActorJoin(actor);
                    }
                });
                gp.addEventListener(LoadBalancing.Constants.EventCode.Leave, function (data) {
                    gp._logger.debug("ev Leave", data);
                    var actorNr = Actor._getActorNrFromResponse(data.vals);
                    if (actorNr && _this.actors[actorNr]) {
                        var a = _this.actors[actorNr];
                        delete _this.actors[actorNr];
                        _this.onActorLeave(a);
                    }
                });
                gp.addEventListener(LoadBalancing.Constants.EventCode.PropertiesChanged, function (data) {
                    gp._logger.debug("ev PropertiesChanged", data);
                    var targetActorNr = data.vals[LoadBalancing.Constants.ParameterCode.TargetActorNr];
                    if (targetActorNr !== undefined && targetActorNr > 0) {
                        if (_this.actors[targetActorNr] !== undefined) {
                            var actor = _this.actors[targetActorNr];
                            actor._updateCustomProperties(data.vals[LoadBalancing.Constants.ParameterCode.Properties]);
                            _this.onActorPropertiesChange(actor);
                        }
                    } else {
                        _this.currentRoom._updateFromProps(data.vals, data.vals[LoadBalancing.Constants.ParameterCode.Properties]);
                        _this.onMyRoomPropertiesChange();
                    }
                });
            };
            LoadBalancingClient.prototype._onOperationResponseInternal2 = function (code, data) {
                this.onOperationResponse(data.errCode, data.errMsg, code, data.vals);
            };

            //TODO: ugly way to init const table
            LoadBalancingClient.prototype.initValidNextState = function () {
                this.validNextState[LoadBalancingClient.State.Error] = [LoadBalancingClient.State.ConnectingToMasterserver];
                this.validNextState[LoadBalancingClient.State.Uninitialized] = [LoadBalancingClient.State.ConnectingToMasterserver];
                this.validNextState[LoadBalancingClient.State.Disconnected] = [LoadBalancingClient.State.ConnectingToMasterserver];
                this.validNextState[LoadBalancingClient.State.ConnectedToMaster] = [LoadBalancingClient.State.JoinedLobby];
                this.validNextState[LoadBalancingClient.State.JoinedLobby] = [LoadBalancingClient.State.ConnectingToGameserver];
                this.validNextState[LoadBalancingClient.State.ConnectingToGameserver] = [LoadBalancingClient.State.ConnectedToGameserver];
                this.validNextState[LoadBalancingClient.State.ConnectedToGameserver] = [LoadBalancingClient.State.Joined];
            };
            LoadBalancingClient.prototype.checkNextState = function (nextState, dontThrow) {
                if (typeof dontThrow === "undefined") { dontThrow = false; }
                var valid = this.validNextState[this.state];
                var res = valid && valid.indexOf(nextState) >= 0;
                if (res || dontThrow) {
                    return res;
                } else {
                    throw new Error("LoadBalancingPeer checkNextState fail: " + LoadBalancingClient.StateToName(this.state) + " -> " + LoadBalancingClient.StateToName(nextState));
                }
            };

            LoadBalancingClient.StateToName = function (value) {
                return Exitgames.Common.Util.enumValueToName(LoadBalancingClient.State, value);
            };
            LoadBalancingClient.PeerErrorCode = {
                Ok: 0,
                MasterError: 1001,
                MasterConnectFailed: 1002,
                MasterConnectClosed: 1003,
                MasterTimeout: 1004,
                MasterAuthenticationFailed: 1101,
                GameError: 2001,
                GameConnectFailed: 2002,
                GameConnectClosed: 2003,
                GameTimeout: 2004,
                GameAuthenticationFailed: 2101
            };
            LoadBalancingClient.State = {
                Error: -1,
                Uninitialized: 0,
                ConnectingToMasterserver: 1,
                ConnectedToMaster: 2,
                JoinedLobby: 3,
                ConnectingToGameserver: 4,
                ConnectedToGameserver: 5,
                Joined: 6,
                Disconnecting: 7,
                Disconnected: 8
            };
            return LoadBalancingClient;
        })();
        LoadBalancing.LoadBalancingClient = LoadBalancingClient;

        //TODO: internal
        var MasterPeer = (function (_super) {
            __extends(MasterPeer, _super);
            function MasterPeer(client, url, subprotocol) {
                _super.call(this, url, subprotocol, "Master");
                this.client = client;
            }
            // overrides
            MasterPeer.prototype.onUnhandledEvent = function (code, args) {
                this.client.onEvent(code, args.vals[LoadBalancing.Constants.ParameterCode.CustomEventContent], args.vals[LoadBalancing.Constants.ParameterCode.ActorNr]);
            };

            // overrides
            MasterPeer.prototype.onUnhandledResponse = function (code, args) {
                this.client.onOperationResponse(args.errCode, args.errMsg, code, args.vals);
            };
            MasterPeer.prototype.findFriends = function (friendsToFind) {
                var params = [];
                params.push(LoadBalancing.Constants.ParameterCode.FindFriendsRequestList);
                params.push(friendsToFind);
                this.sendOperation(LoadBalancing.Constants.OperationCode.FindFriends, params);
            };
            MasterPeer.prototype.requestLobbyStats = function (lobbiesToRequest) {
                var params = [];
                if (lobbiesToRequest && lobbiesToRequest.length > 0) {
                    var n = new Array();
                    var t = new Array();
                    for (var i = 0; i < lobbiesToRequest.length; ++i) {
                        n[i] = lobbiesToRequest[i][0];
                        t[i] = lobbiesToRequest[i][1];
                    }
                    params.push(LoadBalancing.Constants.ParameterCode.LobbyName);
                    params.push(n);
                    params.push(LoadBalancing.Constants.ParameterCode.LobbyType);
                    params.push(t);
                }
                this.sendOperation(LoadBalancing.Constants.OperationCode.LobbyStats, params);
            };
            return MasterPeer;
        })(Photon.PhotonPeer);
        LoadBalancing.MasterPeer = MasterPeer;

        //TODO: internal
        var GamePeer = (function (_super) {
            __extends(GamePeer, _super);
            function GamePeer(client, url, subprotocol) {
                _super.call(this, url, subprotocol, "Game");
                this.client = client;
            }
            // overrides
            GamePeer.prototype.onUnhandledEvent = function (code, args) {
                this.client.onEvent(code, args.vals[LoadBalancing.Constants.ParameterCode.CustomEventContent], args.vals[LoadBalancing.Constants.ParameterCode.ActorNr]);
            };

            // overrides
            GamePeer.prototype.onUnhandledResponse = function (code, args) {
                this.client.onOperationResponse(args.errCode, args.errMsg, code, args.vals);
            };

            GamePeer.prototype.raiseEvent = function (eventCode, data, options) {
                if (this.client.isJoinedToRoom()) {
                    this._logger.debug("raiseEvent", eventCode, data, options);
                    var params = [LoadBalancing.Constants.ParameterCode.Code, eventCode, LoadBalancing.Constants.ParameterCode.Data, data];
                    if (options) {
                        if (options.receivers != undefined && options.receivers !== LoadBalancing.Constants.ReceiverGroup.Others) {
                            params.push(LoadBalancing.Constants.ParameterCode.ReceiverGroup);
                            params.push(options.receivers);
                        }
                        if (options.cache != undefined && options.cache !== LoadBalancing.Constants.EventCaching.DoNotCache) {
                            params.push(LoadBalancing.Constants.ParameterCode.Cache);
                            params.push(options.cache);
                        }
                        if (options.interestGroup != undefined) {
                            if (this.checkGroupNumber(options.interestGroup)) {
                                params.push(LoadBalancing.Constants.ParameterCode.Group);
                                params.push(options.interestGroup);
                            } else {
                                throw new Error("raiseEvent - Group not a number: " + options.interestGroup);
                            }
                        }
                        if (options.targetActors != undefined) {
                            params.push(LoadBalancing.Constants.ParameterCode.ActorList);
                            params.push(options.targetActors);
                        }
                    }
                    this.sendOperation(LoadBalancing.Constants.OperationCode.RaiseEvent, params);
                } else {
                    throw new Error("raiseEvent - Not joined!");
                }
            };

            GamePeer.prototype.changeGroups = function (groupsToRemove, groupsToAdd) {
                var params = [];
                if (groupsToRemove != null && groupsToRemove != undefined) {
                    this.checkGroupArray(groupsToRemove, "groupsToRemove");
                    params.push(LoadBalancing.Constants.ParameterCode.Remove);
                    params.push(groupsToRemove);
                }
                if (groupsToAdd != null && groupsToAdd != undefined) {
                    this.checkGroupArray(groupsToAdd, "groupsToAdd");
                    params.push(LoadBalancing.Constants.ParameterCode.Add);
                    params.push(groupsToAdd);
                }
                this.sendOperation(LoadBalancing.Constants.OperationCode.ChangeGroups, params);
            };
            GamePeer.prototype.checkGroupNumber = function (g) {
                return !(typeof (g) != "number" || isNaN(g) || g === Infinity || g === -Infinity);
            };
            GamePeer.prototype.checkGroupArray = function (groups, groupsName) {
                if (Exitgames.Common.Util.isArray(groups)) {
                    for (var i = 0; i < groups.length; ++i) {
                        var g = groups[i];
                        if (this.checkGroupNumber(g)) {
                        } else {
                            throw new Error("changeGroups - " + groupsName + " (" + groups + ") not an array of numbers: element " + i + " = " + g);
                        }
                    }
                } else {
                    throw new Error("changeGroups - groupsToRemove not an array: " + groups);
                }
            };
            return GamePeer;
        })(Photon.PhotonPeer);
        LoadBalancing.GamePeer = GamePeer;
    })(Photon.LoadBalancing || (Photon.LoadBalancing = {}));
    var LoadBalancing = Photon.LoadBalancing;
})(Photon || (Photon = {}));
//# sourceMappingURL=photon-loadbalancing.js.map
