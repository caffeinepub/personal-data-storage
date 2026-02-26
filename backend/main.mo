import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import Migration "migration";

(with migration = Migration.run)
actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  type FileMetadata = {
    id : Text;
    name : Text;
    size : Nat;
    mimeType : Text;
    uploadedAt : Time.Time;
  };

  type FileReference = {
    blob : Storage.ExternalBlob;
    owner : Principal;
    metadata : FileMetadata;
  };

  let files = Map.empty<Text, FileReference>();

  // Only authenticated users can save file references; owner is always the caller
  public shared ({ caller }) func saveFileReference(
    id : Text,
    blob : Storage.ExternalBlob,
    name : Text,
    size : Nat,
    mimeType : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save file references");
    };

    let metadata : FileMetadata = {
      id;
      name;
      size;
      mimeType;
      uploadedAt = Time.now();
    };

    let reference : FileReference = {
      blob;
      owner = caller;
      metadata;
    };

    files.add(id, reference);
  };

  // Only the owner or an admin can retrieve file metadata
  public query ({ caller }) func getFileMetadata(id : Text) : async FileMetadata {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get file metadata");
    };
    switch (files.get(id)) {
      case (null) {
        Runtime.trap("File not found");
      };
      case (?ref) {
        if (ref.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only access your own files");
        };
        ref.metadata;
      };
    };
  };

  // Only the owner or an admin can remove a file reference
  public shared ({ caller }) func removeFileReference(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove file references");
    };
    switch (files.get(id)) {
      case (null) {
        Runtime.trap("File not found");
      };
      case (?ref) {
        if (ref.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only remove your own files");
        };
        files.remove(id);
      };
    };
  };

  // Users can only list their own files; admins can list any user's files
  public query ({ caller }) func listUserFiles(user : Principal) : async [FileMetadata] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list files");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only list your own files");
    };
    files.values().toArray().filter(func(ref : FileReference) : Bool { ref.owner == user }).map(func(ref : FileReference) : FileMetadata { ref.metadata });
  };

  // Per-user quota is public information
  public query func getPerUserQuota(_user : Principal) : async Nat {
    1_000_000_000_000_000; // 1000 TB
  };

  // Only admins can list all files
  public query ({ caller }) func getAllFiles() : async [FileMetadata] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can list all files");
    };
    files.values().map(func(ref : FileReference) : FileMetadata { ref.metadata }).toArray();
  };

  // Only admins can run cleanup
  public shared ({ caller }) func cleanUp() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can run cleanup");
    };
  };
};
