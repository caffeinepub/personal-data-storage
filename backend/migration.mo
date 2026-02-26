import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";

module {
  type OldFileData = {
    metadata : {
      id : Text;
      name : Text;
      size : Nat;
      uploadedAt : Time.Time;
      mimeType : Text;
    };
    blob : Storage.ExternalBlob;
    owner : Principal;
  };

  type OldActor = {
    files : Map.Map<Text, OldFileData>;
    usedStorage : Map.Map<Principal, Nat>;
    storageQuota : Map.Map<Principal, Nat>;
    directory : Map.Map<Principal, Text>;
    systemDirectory : Map.Map<Time.Time, Text>;
    adminDirectory : Map.Map<Principal, Text>;
    userDirectory : Map.Map<Principal, Text>;
    shareDirectory : Map.Map<Principal, Text>;
  };

  type NewActor = {
    files : Map.Map<Text, {
      blob : Storage.ExternalBlob;
      owner : Principal;
      metadata : {
        id : Text;
        name : Text;
        size : Nat;
        mimeType : Text;
        uploadedAt : Time.Time;
      };
    }>;
  };

  public func run(old : OldActor) : NewActor {
    { files = old.files };
  };
};
